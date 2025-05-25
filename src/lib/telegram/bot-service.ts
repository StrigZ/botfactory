// Main bot logic goes here
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from '@grammyjs/conversations';
import { type InferSelectModel, eq } from 'drizzle-orm';
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
    this.registerConversation();
    this.registerHandlers();
  }

  getBot() {
    return this.bot;
  }

  registerMiddlewares() {
    this.bot.use(session({ initial: () => ({ variables: {} }) }));
    this.bot.use(conversations());

    this.bot.catch((e) =>
      console.error(
        'ERROR \n **************\n' + e.message + '\n **************',
      ),
    );
  }

  registerConversation() {
    this.bot.use(createConversation(this.workflowConversation.bind(this)));
  }

  async findWorkflow() {
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

  async findFirstNodeInWorkflow(
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

    return conversation;
  }

  async workflowConversation(
    conversation: MyConversation,
    ctx: MyConversationContext,
  ) {
    const workflow = await this.findWorkflow();

    const firstNode = await this.findFirstNodeInWorkflow(workflow);
    // Process the start node
    // await this.processNode(startNode, ctx, workflow);

    // Continue processing nodes based on user input
    while (true) {
      // Wait for user input
      const message = await conversation.wait();

      // Get current node ID from session
      const currentNodeId = ctx.session.currentNodeId;
      if (!currentNodeId) break;

      // Find current node
      const currentNode = workflow.workflowNodes.find(
        (node) => node.id === currentNodeId,
      );
      if (!currentNode) break;

      // Process user input based on node type
      if (currentNode.type === 'input') {
        // Save variable
        // const variableName = currentNode.data.variableName || 'input';
        // ctx.session.variables[variableName] = message.text;
        // Find the next node
      }
      await ctx.reply(
        'your message: ' +
          (message.msg?.text ?? '') +
          'continuing conversation...',
      );

      const edge = workflow.workflowEdges.find(
        (edge) => edge.sourceId === currentNode.id,
      );
      if (edge) {
        const nextNode = workflow.workflowNodes.find(
          (node) => node.id === edge.targetId,
        );
        if (nextNode) {
          ctx.session.currentNodeId = nextNode.id;
          // await this.processNode(nextNode, ctx, workflowData);
        }
      }
    }
  }

  registerHandlers() {
    this.bot.command('start', async (ctx) => {
      await this.startNewConversation(ctx);

      // TODO: Replace with first node action
      // this.processNode(firstNode)
      await ctx.reply('Hello! Bot is ready to work!');
    });

    this.bot.on('message:text', async (ctx) => {
      const messageText = ctx.message.text;

      const conversation = ctx.session.conversationId
        ? await db.query.botConversations.findFirst({
            where: eq(botConversations.id, ctx.session.conversationId),
          })
        : await this.startNewConversation(ctx);

      // Get workflow
      const workflow = await this.findWorkflow();
      if (!workflow) {
        await ctx.reply('Sorry, this bot is not properly configured.');
        return;
      }

      // Get current node
      const currentNode = workflow.workflowNodes.find(
        (node) => node.id === conversation?.currentNodeId,
      );

      if (!currentNode) {
        await ctx.reply(
          "Sorry, I lost track of our conversation. Let's start over.",
        );
        await this.startNewConversation(ctx);
        return;
      }
      await ctx.reply('your message: ' + messageText + '. Continuing convo.');
      // Handle input for input nodes
      if (currentNode.type === 'input') {
        // // const variableName = currentNode.data.variableName || 'input';
        // // const variables = {
        // //   ...conversation.variables,
        // //   [variableName]: messageText,
        // // };
        // // Update conversation with new variable
        // await db
        //   .update(conversations)
        //   .set({
        //     variables,
        //     lastMessageAt: new Date(),
        //   })
        //   .where(eq(conversations.id, conversation.id));
        // Update session
        // ctx.session.variables = variables;
        // Proceed to next node
        // await this.proceedToNextNode(currentNode, ctx, workflow);
      } else {
        // For other node types, just process the current node again
        // await this.processNode(currentNode, ctx, workflow);
      }
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

  static async getMe(token: string) {
    try {
      const api = new Api(token);
      await api.getMe();
      return { success: true };
    } catch (error) {
      console.error('Error calling getMe api:  ', error);
      return { success: false, error };
    }
  }
}
