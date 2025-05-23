// Main bot logic goes here
import { Api, Bot, type Context, type SessionFlavor, session } from 'grammy';
import type { Update } from 'grammy/types';

import { db } from '~/server/db';
import { botConversations } from '~/server/db/schema';

// setup errors handling

// handle text messages
// process nodes

// replace variables

type SessionData = {
  conversationId?: string;
  currentNodeId?: string;
  variables: Record<string, unknown>;
};

export type BotContext = Context & SessionFlavor<SessionData>;

export class BotService {
  bot: Bot<BotContext>;
  botId: string;
  constructor(token: string, botId: string) {
    this.bot = new Bot(token);
    this.botId = botId;
    this.registerMiddlewares();
    this.registerHandlers();
  }

  getBot() {
    return this.bot;
  }

  registerMiddlewares() {
    this.bot.use(session({ initial: () => ({ variables: {} }) }));

    this.bot.catch((e) =>
      console.error(
        'ERROR \n **************\n' + e.message + '\n **************',
      ),
    );
  }

  registerHandlers() {
    this.bot.command('start', async (ctx) => {
      // Get bot data from DB
      const botData = await db.query.bots.findFirst({
        where: ({ id }, { eq }) => eq(id, this.botId),
        with: {
          botWorkflowsToBots: true,
        },
      });

      if (!botData) {
        throw new Error("Bot doesn't exist.");
      }

      // Get workflow data for this bot
      const workflowData = await db.query.botWorkflows.findFirst({
        where: ({ id }, { eq }) =>
          eq(id, botData.botWorkflowsToBots.botWorkflowId),
        with: { workflowNodes: true, workflowEdges: true },
      });

      if (!workflowData) {
        throw new Error("Bot doesn't have workflow.");
      }
      // Find first node
      const nodes = workflowData.workflowNodes;
      const edges = workflowData.workflowEdges;

      const firstNode = nodes.find(
        (node) =>
          node.type === 'message' &&
          !edges.some((edge) => edge.targetId === node.id),
      );

      if (!firstNode) {
        throw new Error('Workflow is not properly configured.');
      }

      // Create new conversation in DB
      const [conversation] = await db
        .insert(botConversations)
        .values({ botId: this.botId, currentNodeId: firstNode.id })
        .returning();

      if (!conversation) {
        throw new Error("Couldn't create new conversation.");
      }

      // Reset session
      ctx.session.currentNodeId = firstNode.id;
      ctx.session.conversationId = conversation.id;
      ctx.session.variables = {};

      // TODO: Replace with first node action
      // this.processNode(firstNode)
      await ctx.reply('Hello! Bot is ready to work!');
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
