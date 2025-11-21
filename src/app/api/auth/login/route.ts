'use server';

import type { NextRequest } from 'next/server';

import type { User } from '~/context/AuthContext';
import { env } from '~/env';
import { setTokens } from '~/lib/auth';
import { getTokensFromCookies } from '~/lib/utils';

type AuthProviderData = { token: string };
type AuthData = { email: string; password: string };

type RequestData = AuthProviderData | AuthData;

type ResponseData = {
  user: User;
};

const API_URL = env.API_URL ?? 'http://localhost:3000';

export async function POST(request: NextRequest) {
  const requestData = (await request.json()) as RequestData;

  if (!('token' in requestData)) {
    // email + password login
    return;
  }

  const requestOption: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: requestData.token }),
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
    const tokens = await getTokensFromCookies(cookies);

    if (!tokens) {
      return Response.json(
        {},
        { status: 401, statusText: 'Authorization failed!' },
      );
    }

    await setTokens(tokens);

    return Response.json({ user: data.user });
  } catch (e) {
    console.error(e);
    throw e;
  }
}
