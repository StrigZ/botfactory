import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

import { env } from '~/env';
import type { Bot } from '~/lib/bot-api-client';

const API_URL = env.API_URL;

export async function POST(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const { id } = await params;

  const requestOption: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: (await cookies()).toString(),
      credentials: 'include',
    },
  };

  try {
    const res = await fetch(`${API_URL}/bots/${id}/undeploy/`, requestOption);

    if (!res.ok) {
      throw new Error('Error during /api/bots/id api call: ' + res.statusText);
    }

    const data = (await res.json()) as Bot;

    return Response.json(data);
  } catch (e) {
    console.error(e);
    return Response.json({
      status: 500,
      message: 'Unexpected error occurred during bot pausing.',
    });
  }
}
