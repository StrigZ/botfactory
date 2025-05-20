import { Bot, webhookCallback } from 'grammy';

import { db } from '~/server/db';

export const dynamic = 'force-dynamic';

export const fetchCache = 'force-no-store';

export async function POST({ params }: { params: Promise<{ botId: string }> }) {
  const { botId } = await params;
  const bot = await db.query.bots.findFirst({
    where: ({ id }, { eq }) => eq(id, botId),
  });

  if (bot) {
    const botInstance = new Bot(bot?.token);
    botInstance.on('message:text', async (ctx) => {
      await ctx.reply(ctx.message.text);
    });
    return webhookCallback(botInstance, 'std/http');
  }
}
