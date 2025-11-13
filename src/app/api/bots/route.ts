import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

import { env } from '~/env';
import type { Bot, CreateBotInput } from '~/lib/bot-api-client';

const API_URL = env.API_URL;

export async function POST(request: NextRequest) {
  const requestData = (await request.json()) as CreateBotInput;

  const requestOption: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: (await cookies()).toString(),
      credentials: 'include',
    },
    body: JSON.stringify(requestData),
  };

  try {
    const res = await fetch(`${API_URL}/bots/`, requestOption);

    if (!res.ok) {
      throw new Error('Error during /api/bots api call: ' + res.statusText);
    }

    const data = (await res.json()) as Bot;

    return Response.json(data);
  } catch (e) {
    console.error(e);
    return Response.json({
      status: 500,
      message: 'Unexpected error occurred during bot creation.',
    });
  }
}

export async function GET(request: NextRequest) {
  const requestOption: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      Cookie: (await cookies()).toString(),
      credentials: 'include',
    },
  };

  try {
    const res = await fetch(`${API_URL}/bots/`, requestOption);

    if (!res.ok) {
      throw new Error('Error during /api/bots api call: ' + res.statusText);
    }

    const data = (await res.json()) as Bot[];

    return Response.json(data);
  } catch (e) {
    console.error(e);
    return Response.json({
      status: 500,
      message: 'Unexpected error occurred during bots fetching.',
    });
  }
}
