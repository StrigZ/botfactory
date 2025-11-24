import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

import { env } from '~/env';
import type { Bot, CreateBotInput } from '~/lib/bot-api-client';
import { getBots } from '~/lib/dal';
import { handleApiRequest } from '~/lib/django-fetch';

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
    return Response.json(
      {
        message: 'Unexpected error occurred during bot creation.',
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return await handleApiRequest<Bot[]>(getBots);
}
