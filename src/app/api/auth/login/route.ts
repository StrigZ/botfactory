'use server';

import type { NextRequest } from 'next/server';

import type { User } from '~/context/AuthContext';
import { env } from '~/env';
import { setTokens } from '~/lib/auth';
import type { LoginWithGoogleInput } from '~/lib/user-api-client';
import { getTokensFromCookies } from '~/lib/utils';

type ResponseData = {
  user: User;
};

const API_URL = env.API_URL ?? 'http://localhost:3000';

export async function POST(request: NextRequest) {
  const requestData = (await request.json()) as LoginWithGoogleInput;

  const requestOption: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: requestData.credentials }),
  };

  try {
    const res = await fetch(`${API_URL}/accounts/google/`, requestOption);
    if (!res.ok) {
      throw new Error(
        'Error during /api/accounts/google api call: ' + res.statusText,
      );
    }

    const data = (await res.json()) as ResponseData;
    const cookies = res.headers.getSetCookie();
    const tokens = getTokensFromCookies(cookies);

    if (!tokens) {
      return Response.json(
        {},
        { status: 401, statusText: 'Authorization failed!' },
      );
    }

    await setTokens(tokens);

    return Response.json({ user: data.user });
  } catch (e: unknown) {
    console.log(e);
    const message = e instanceof Error ? e.message : 'Authorization failed!';
    const status = (e as { status?: number })?.status ?? 500;

    return Response.json(
      { message },
      { status, statusText: 'Authorization failed!' },
    );
  }
}
