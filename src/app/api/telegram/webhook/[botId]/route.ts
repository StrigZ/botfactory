import { webhookCallback } from 'grammy';
import { NextResponse } from 'next/server';

import { BotService } from '~/lib/telegram/bot-service';
import { db } from '~/server/db';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// CORS headers to be applied to all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Or specify domains like 'https://example.com'
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400', // 24 hours cache for preflight
};

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(
  request: Request,
  { params }: { params: { botId: string } },
) {
  try {
    const { botId } = params;

    // Validate bot ID
    if (!botId || typeof botId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid bot ID' },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const botData = await db.query.bots.findFirst({
      where: ({ id }, { eq }) => eq(id, botId),
    });

    if (!botData) {
      return NextResponse.json(
        { error: 'Bot with this ID does not exist' },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    if (!botData.token) {
      return NextResponse.json(
        { error: 'Token is invalid or missing.' },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const botService = await BotService.create(botData.token, botData.id);

    // Process Telegram update with Grammy's webhook handler
    const grammyResponse = await webhookCallback(
      botService.getBot(),
      'std/http',
    )(request);

    // Create a new response with the same body and status but with CORS headers
    const responseBody = await grammyResponse.text();
    const newResponse = new Response(responseBody, {
      status: grammyResponse.status,
      statusText: grammyResponse.statusText,
      headers: {
        ...Object.fromEntries(grammyResponse.headers),
        ...corsHeaders,
      },
    });

    return newResponse;
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}
