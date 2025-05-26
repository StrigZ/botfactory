// Main bot logic goes here
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from '@grammyjs/conversations';
import { type InferSelectModel, and, eq } from 'drizzle-orm';
import { Api, Bot, type Context, type SessionFlavor, session } from 'grammy';
import type { Update } from 'grammy/types';

import { db } from '~/server/db';
import {
  botConversations,
  type botWorkflows,
  type workflowEdges,
  type workflowNodes,
} from '~/server/db/schema';

// setup errors handling

// handle text messages
// process nodes

// replace variables

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

export class BotService {
  bot: Bot<BotContext>;
  botId: string;
  constructor(token: string, botId: string) {
    this.bot = new Bot(token);
    this.botId = botId;
    this.registerMiddlewares();
    this.registerHandlers();
  }

  async processNode(
    node: InferSelectModel<typeof workflowNodes>,
    ctx: MyConversationContext,
  ) {
    switch (node.type) {
      case 'message':
        const messageNodeData = node.data as MessageNodeData;
        await ctx.reply(messageNodeData.message);
        break;
      case 'input':
        const inputNodeData = node.data as InputNodeData;
        await ctx.reply(inputNodeData.message);
        break;

      default:
        await ctx.reply(
          (node.data as MessageNodeData).message ?? 'No message was found',
        );
        break;
    }
  }

  registerMiddlewares() {
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

  async startNewConversation(ctx: BotContext) {
    const workflow = await this.findWorkflow();

    const firstNode = await this.findFirstNodeInWorkflow(workflow);

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

  async workflowConversation(
    conversation: MyConversation,
    ctx: MyConversationContext,
  ) {
    // At the start of the conversation, find current workflow
    const workflow = await this.findWorkflow();
    const nodes = workflow.workflowNodes;
    const edges = workflow.workflowEdges;

    // Get first node and process it
    const firstNode = await this.findFirstNodeInWorkflow(workflow);
    await this.processNode(firstNode, ctx);

    // Listen for replies and repeat
    while (true) {
      // Wait for reply
      const newCtx = await conversation.wait();
      // Read session data inside a conversation
      const session = await conversation.external((ctx) => ctx.session);

      // Get the id of the current node
      const currentNodeId = session.currentNodeId;

      if (!currentNodeId) {
        throw new Error('Current node id is not found.');
      }
      const currentNode = nodes.find((node) => node.id === currentNodeId);
      if (!currentNode) {
        throw new Error('Current node is not found.');
      }

      // if current node is of type input
      // save user's reply to variables
      if (currentNode.type === 'input') {
        const inputNodeData = currentNode.data as InputNodeData;
        await newCtx.reply(
          'Saving this to the variable' + inputNodeData.variableName,
        );
        session.variables[inputNodeData.variableName] = newCtx.message?.text;
      }
      // Specific tasks for each node go here...

      // Find edge to the next node
      const edgeToNextNode = edges.find(
        (edge) => edge.sourceId === currentNode.id,
      );

      // Check if this is a last node
      if (!edgeToNextNode) {
        await newCtx.reply('You have reached the end of the conversation!');

        // Update conversation data db
        await conversation.external(async (ctx) => {
          ctx.session = session;
          if (ctx.session.conversationId) {
            await db
              .update(botConversations)
              .set({
                currentNodeId: ctx.session.currentNodeId,
                variables: ctx.session.variables,
              })
              .where(eq(botConversations.id, ctx.session.conversationId));
          }
        });
        break;
      }

      // Get next node id via edge's targetId
      const nextNode = nodes.find(
        (node) => node.id === edgeToNextNode.targetId,
      );
      if (!nextNode) {
        throw new Error('Next node is not found.');
      }

      // Save next node in session for the next reply
      session.currentNodeId = nextNode.id;

      // Update external session and conversation data in db
      await conversation.external(async (ctx) => {
        ctx.session = session;
        if (ctx.session.conversationId) {
          await db
            .update(botConversations)
            .set({
              currentNodeId: session.currentNodeId,
              variables: session.variables,
            })
            .where(eq(botConversations.id, ctx.session.conversationId));
        }
      });
      // process next node
      await this.processNode(nextNode, newCtx);
    }
  }

  registerHandlers() {
    this.bot.command('start', async (ctx) => {
      // TODO: Replace with first node action
      // this.processNode(firstNode)
      await ctx.reply('Hello! Bot is ready to work! Starting conversation...');
      await this.startNewConversation(ctx);
    });
  }

  async handleUpdate(update: Update) {
    try {
      await this.bot.handleUpdate(update);
    } catch (error) {
      console.error('Error handling update', error);
    }
  }

  async setupWebhook(webhookUrl: string) {
    try {
      await this.bot.api.setWebhook(webhookUrl);
      return true;
    } catch (error) {
      console.error('Error calling setWebhook api: ', error);
      return false;
    }
  }

  async removeWebhook() {
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

  private async findWorkflow() {
    const botData = await db.query.bots.findFirst({
      where: ({ id }, { eq }) => eq(id, this.botId),
      with: {
        botWorkflowsToBots: true,
      },
    });

    if (!botData) {
      throw new Error("Bot doesn't exist.");
    }
    const workflowData = await db.query.botWorkflows.findFirst({
      where: ({ id }, { eq }) =>
        eq(id, botData.botWorkflowsToBots.botWorkflowId),
      with: { workflowNodes: true, workflowEdges: true },
    });

    if (!workflowData) {
      throw new Error("Bot doesn't have workflow.");
    }

    return workflowData;
  }

  private async findFirstNodeInWorkflow(
    workflow: InferSelectModel<typeof botWorkflows> & {
      workflowNodes: InferSelectModel<typeof workflowNodes>[];
      workflowEdges: InferSelectModel<typeof workflowEdges>[];
    },
  ) {
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
}
