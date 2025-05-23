import { eq } from 'drizzle-orm';

import { env } from '~/env';
import { db } from '~/server/db';
import { botDeployments, bots } from '~/server/db/schema';

import { startDevBot, stopDevBot } from '../dev-bot';
import { BotService } from './bot-service';

export class BotDeploymentService {
  private botService: BotService;
  private botId: string;
  constructor(token: string, botId: string) {
    this.botService = new BotService(token, botId);
    this.botId = botId;
  }

  async deployBot() {
    let currentDeployment;
    try {
      const [newDeployment] = await db
        .insert(botDeployments)
        .values({ botId: this.botId, status: 'in_progress' })
        .returning();

      if (!newDeployment) {
        throw new Error('Failed to create new deployment entry in DB.');
      }

      currentDeployment = newDeployment;

      const webhookUrl = `${env.VERCEL_URL}/api/telegram/webhook/${this.botId}?x-vercel-protection-bypass=${env.VERCEL_AUTOMATION_BYPASS_SECRET}`;
      const success =
        env.NODE_ENV === 'production'
          ? await this.botService.setupWebhook(webhookUrl)
          : await startDevBot(this.botService.bot.token, this.botService.botId);

      if (!success) {
        throw new Error('Failed to set the webhook.');
      }

      await db
        .update(botDeployments)
        .set({ status: 'deployed' })
        .where(eq(botDeployments.id, currentDeployment.id));

      await db
        .update(bots)
        .set({ status: 'published' })
        .where(eq(bots.id, this.botId));

      return { success: true, webhookUrl };
    } catch (error) {
      console.error('Error during deployment: ', error);
      if (currentDeployment) {
        await db
          .update(botDeployments)
          .set({ status: 'failed' })
          .where(eq(botDeployments.id, currentDeployment.id));
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown Error.',
      };
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

      await db.update(bots).set({ status: 'paused' }).where(eq(bots.id, botId));

      return { success: true };
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to undeploy the bot: ', error);

        return { success: false, error: error.message };
      }
    }
  }
}
