// Main bot logic goes here
import { Bot, type Context, type SessionFlavor, session } from 'grammy';
import type { Update } from 'grammy/types';

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
  constructor(token: string) {
    this.bot = new Bot(token);

    this.registerMiddlewares();
    this.registerHandlers();
  }

  getBot() {
    return this.bot;
  }

  registerMiddlewares() {
    this.bot.use(session({ initial: () => ({ variables: {} }) }));
  }

  registerHandlers() {
    this.bot.command('start', async (ctx) => {
      await ctx.reply('Your message is:' + ctx.msg.text);
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

  async getMe() {
    try {
      await this.bot.api.getMe();
      return { success: true };
    } catch (error) {
      console.error('Error calling getMe api:  ', error);
      return { success: false, error };
    }
  }
}
