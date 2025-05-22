import { eq } from 'drizzle-orm';

import { env } from '~/env';
import { db } from '~/server/db';
import { bots } from '~/server/db/schema';

import { startDevBot, stopDevBot } from '../dev-bot';
import { BotService } from './bot-service';

export class BotDeploymentService {
  private botService: BotService;
  constructor(token: string) {
    this.botService = new BotService(token);
  }

  async deployBot(botId: string) {
    const webhookUrl = `${env.VERCEL_URL}/api/telegram/webhook/${botId}?x-vercel-protection-bypass=${env.VERCEL_AUTOMATION_BYPASS_SECRET}`;
    try {
      const success =
        env.NODE_ENV === 'production'
          ? await this.botService.setupWebhook(webhookUrl)
          : await startDevBot(this.botService.bot.token);

      if (!success) {
        throw new Error('Failed to set the webhook.');
      }
      // update deployment data in db
      // update bot data in db
      await db
        .update(bots)
        .set({ webhookUrl, isDeployed: true })
        .where(eq(bots.id, botId));
      return { success: true, webhookUrl };
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error during deployment: ', error);
        // TODO: update deployment status to failed in deployment schema
        return { success: false, error: error.message };
      }
    }
  }

  async undeployBot(botId: string) {
    try {
      const success =
        env.NODE_ENV === 'production'
          ? await this.botService.removeWebhook()
          : stopDevBot();

      if (!success) {
        throw new Error('Failed to remove the webhook.');
      }
      // update bot status in bot schema
      await db
        .update(bots)
        .set({ isDeployed: false })
        .where(eq(bots.id, botId));

      return { success: true };
      // TODO: update deployment status to paused in deployment schema
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to undeploy the bot: ', error);
        // TODO: update deployment status to failed in deployment schema
        return { success: false, error: error.message };
      }
    }
  }
}
