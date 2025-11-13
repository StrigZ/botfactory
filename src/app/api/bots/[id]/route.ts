import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

import { env } from '~/env';
import type { Bot, UpdateBotInput } from '~/lib/bot-api-client';

const API_URL = env.API_URL;

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const { id } = await params;

  const requestOption: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      Cookie: (await cookies()).toString(),
      credentials: 'include',
    },
  };

  try {
    const res = await fetch(`${API_URL}/bots/${id}/`, requestOption);

    if (!res.ok) {
      throw new Error('Error during /api/bots/id api call: ' + res.statusText);
    }

    const data = (await res.json()) as Bot;

    return Response.json(data);
  } catch (e) {
    console.error(e);
    return Response.json({
      status: 500,
      message: 'Unexpected error occurred during bot fetching.',
    });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const { id } = await params;
  const requestData = (await request.json()) as UpdateBotInput;
  const requestOption: RequestInit = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',

      Cookie: (await cookies()).toString(),
      credentials: 'include',
    },
    body: JSON.stringify(requestData),
  };

  try {
    const res = await fetch(`${API_URL}/bots/${id}/`, requestOption);

    if (!res.ok) {
      throw new Error('Error during /api/bots/id api call: ' + res.statusText);
    }

    const data = (await res.json()) as Bot;

    return Response.json(data);
  } catch (e) {
    console.error(e);
    return Response.json({
      status: 500,
      message: 'Unexpected error occurred during bot updating.',
    });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const { id } = await params;
  const requestOption: RequestInit = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',

      Cookie: (await cookies()).toString(),
      credentials: 'include',
    },
  };

  try {
    const res = await fetch(`${API_URL}/bots/${id}/`, requestOption);

    if (!res.ok) {
      throw new Error('Error during /api/bots/id api call: ' + res.statusText);
    }

    return Response.json({ status: 200 });
  } catch (e) {
    console.error(e);
    return Response.json({
      status: 500,
      message: 'Unexpected error occurred during bot deletion.',
    });
  }
}
