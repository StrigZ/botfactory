import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from '@grammyjs/conversations';
import { eq } from 'drizzle-orm';
import { Api, Bot, type Context, type SessionFlavor, session } from 'grammy';

import { db } from '~/server/db';
import {
  type BotWorkflow,
  type NodeType,
  type WorkflowEdge,
  type WorkflowNode,
  botConversations,
} from '~/server/db/schema';

type MessageNodeData = {
  message: string;
};
type InputNodeData = {
  message: string;
  variableName: string;
};

type SessionData = {
  telegramUserId?: string;
  conversationId?: string;
  currentNodeId?: string;
  variables: Record<string, unknown>;
};

// Outside context objects (knows all middleware plugins)
type BotContext = ConversationFlavor<Context & SessionFlavor<SessionData>>;
// Inside context objects (knows all conversation plugins)
type MyConversationContext = Context & SessionFlavor<SessionData>;

type MyConversation = Conversation<BotContext, MyConversationContext>;

export type BotWorkflowWithNodesAndEdges = BotWorkflow & {
  workflowNodes: WorkflowNode[];
  workflowEdges: WorkflowEdge[];
};

const nodeTypesThatNeedNewContext: NodeType[] = ['input'];

export class BotService {
  private bot: Bot<BotContext>;
  private botId: string;
  public botWorkflow: BotWorkflowWithNodesAndEdges;
  constructor(
    token: string,
    botId: string,
    botWorkflow: BotWorkflowWithNodesAndEdges,
  ) {
    this.bot = new Bot(token);
    this.botId = botId;
    this.botWorkflow = botWorkflow;
    this.registerMiddlewares();
    this.registerHandlers();
  }

  private registerMiddlewares() {
    this.bot.use(session({ initial: () => ({ variables: {} }) }));
    this.bot.use(conversations({}));
    this.bot.use(
      createConversation(this.workflowConversation.bind(this), { id: 'main' }),
    );
    this.bot.catch((e) =>
      console.error(
        'ERROR \n **************\n' + e.message + '\n **************',
      ),
    );
  }

  private async startNewConversation(ctx: BotContext) {
    const firstNode = await this.getFirstNodeInWorkflow(this.botWorkflow);

    // Create new conversation in DB
    const [conversation] = await db
      .insert(botConversations)
      // TODO: save user tg id
      .values({ botId: this.botId, currentNodeId: firstNode.id })
      .returning();

    if (!conversation) {
      throw new Error("Couldn't create new conversation.");
    }

    // Reset session
    ctx.session.telegramUserId = ctx.from?.id.toString();
    ctx.session.currentNodeId = conversation.currentNodeId;
    ctx.session.conversationId = conversation.id;
    ctx.session.variables = {};

    await ctx.conversation.enter('main');
    return conversation;
  }

  private async workflowConversation(
    conversation: MyConversation,
    ctx: MyConversationContext,
  ) {
    // At the start of the conversation, find current workflow
    const workflow = this.botWorkflow;
    const nodes = workflow.workflowNodes;
    const edges = workflow.workflowEdges;

    // Listen for replies and repeat
    while (true) {
      // get external session
      const internalSession = await conversation.external(
        (externalCtx) => externalCtx.session,
      );

      // Get the id of the current node
      const currentNodeId =
        internalSession.currentNodeId ??
        (await this.getFirstNodeInWorkflow(workflow)).id;

      const currentNode = nodes.find((node) => node.id === currentNodeId);
      if (!currentNode) {
        throw new Error('Current node is not found.');
      }

      // Send current node's message
      await ctx.reply(
        this.replaceVariables(
          (currentNode.data as MessageNodeData).message,
          internalSession.variables,
        ),
      );

      // if current node's type is not input
      // don't wait for response
      const newCtx = nodeTypesThatNeedNewContext.includes(currentNode.type)
        ? await conversation.wait()
        : ctx;

      // process node
      await this.processNode(currentNode, newCtx, internalSession);

      // Find edge to the next node
      const edgeToNextNode = edges.find(
        (edge) => edge.sourceId === currentNode.id,
      );

      // Check if this is a last node
      if (!edgeToNextNode) {
        await newCtx.reply('You have reached the end of the conversation!');
        await this.saveConversationData(conversation, internalSession);
        break;
      }

      // Get next node id via edge's targetId
      const nextNode = await this.getNextNodeByEdge(edgeToNextNode);

      // Save next node in session for the next reply
      internalSession.currentNodeId = nextNode.id;

      await this.saveConversationData(conversation, internalSession);
    }
  }

  private async getNextNodeByEdge(edgeToNextNode: WorkflowEdge) {
    const workflowNodes = this.botWorkflow.workflowNodes;
    const nextNode = workflowNodes.find(
      (node) => node.id === edgeToNextNode.targetId,
    );
    if (!nextNode) {
      throw new Error('Next node is not found.');
    }
    return nextNode;
  }

  private async saveConversationData(
    conversation: MyConversation,
    internalSession: SessionData,
  ) {
    await conversation.external(async (ctx) => {
      // Sync external session with internalSession session
      ctx.session = internalSession;
      if (ctx.session.conversationId) {
        // Update conversation data in db
        await db
          .update(botConversations)
          .set({
            currentNodeId: internalSession.currentNodeId,
            variables: internalSession.variables,
          })
          .where(eq(botConversations.id, ctx.session.conversationId));
      }
    });
  }

  private async processNode(
    node: WorkflowNode,
    ctx: MyConversationContext,
    internalSession: SessionData,
  ) {
    switch (node.type) {
      case 'input':
        const inputNodeData = node.data as InputNodeData;
        await ctx.reply(
          `Saving this to the variable \`${inputNodeData.variableName}\``,
        );
        internalSession.variables[inputNodeData.variableName] =
          ctx.message?.text;
        break;

      default:
        break;
    }
  }

  private registerHandlers() {
    this.bot.command('start', async (ctx) => {
      await ctx.reply('Hello! Bot is ready to work! Starting conversation...');
      await this.startNewConversation(ctx);
    });
  }

  private replaceVariables(str: string, variables: Record<string, unknown>) {
    if (!str.includes('%s')) {
      return str;
    }

    return str
      .split('%s')
      .map((substring, i) => {
        if (i % 2 === 0) {
          return substring;
        }

        if (!Object.keys(variables).includes(substring)) {
          throw new Error(
            "Variable with that name doesn't exist in session variables.",
          );
        }

        return variables[substring];
      })
      .join('');
  }

  private async getFirstNodeInWorkflow(workflow: BotWorkflowWithNodesAndEdges) {
    const nodes = workflow.workflowNodes;
    const edges = workflow.workflowEdges;

    const firstNode = nodes.find(
      (node) =>
        node.type === 'message' &&
        !edges.some((edge) => edge.targetId === node.id),
    );

    if (!firstNode) {
      throw new Error('Workflow is not properly configured.');
    }

    return firstNode;
  }

  public async setupWebhook(webhookUrl: string) {
    try {
      await this.bot.api.setWebhook(webhookUrl);
      return true;
    } catch (error) {
      console.error('Error calling setWebhook api: ', error);
      return false;
    }
  }

  public async removeWebhook() {
    try {
      await this.bot.api.deleteWebhook();
      return true;
    } catch (error) {
      console.error('Error calling deleteWebhook api:  ', error);
      return false;
    }
  }

  public getBot() {
    return this.bot;
  }

  public static async getMe(token: string) {
    try {
      const api = new Api(token);
      await api.getMe();
      return { success: true };
    } catch (error) {
      console.error('Error calling getMe api:  ', error);
      return { success: false, error };
    }
  }

  public static async create(token: string, botId: string) {
    const botData = await db.query.bots.findFirst({
      where: ({ id }, { eq }) => eq(id, botId),
      with: {
        botWorkflowsToBots: true,
      },
    });

    if (!botData) {
      throw new Error("Bot with this id doesn't exist.");
    }
    const workflowData = await db.query.botWorkflows.findFirst({
      where: ({ id }, { eq }) =>
        eq(id, botData.botWorkflowsToBots.botWorkflowId),
      with: { workflowNodes: true, workflowEdges: true },
    });

    if (!workflowData) {
      throw new Error("Bot doesn't have configured workflow.");
    }

    return new BotService(token, botId, workflowData);
  }
}
