import { Bot, webhookCallback } from 'grammy';
import { NextResponse } from 'next/server';

import { db } from '~/server/db';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Bot instance cache
const botInstances = new Map<string, Bot>();

async function createBotInstance(botId: string) {
  // Check for existing instance
  if (botInstances.has(botId)) {
    return botInstances.get(botId)!;
  }

  // Fetch bot token from database
  const botData = await db.query.bots.findFirst({
    where: ({ id }, { eq }) => eq(id, botId),
  });

  if (!botData?.token) {
    throw new Error('Bot not found or missing token');
  }

  // Create and configure new bot
  const bot = new Bot(botData.token);

  // Add message handler
  bot.on('message:text', async (ctx) => {
    await ctx.reply(ctx.message.text);
  });
  bot.command('start', async (ctx) => ctx.reply('DAROVA'));

  // Cache instance
  botInstances.set(botId, bot);
  return bot;
}

export async function POST(
  request: Request,
  { params }: { params: { botId: string } },
) {
  try {
    const { botId } = params;

    // Validate bot ID
    if (!botId || typeof botId !== 'string') {
      return NextResponse.json({ error: 'Invalid bot ID' }, { status: 400 });
    }

    // Get or create bot instance
    const bot = await createBotInstance(botId);

    // Process Telegram update
    return webhookCallback(bot, 'std/http')(request);
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
