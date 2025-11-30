'use server';

import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

import type { User } from '~/context/AuthContext';
import { env } from '~/env';

import { djangoFetch, verifySession } from './django-fetch';
import type { LoginWithGoogleInput } from './user-api-client';
import { getTokensFromCookies } from './utils';

const API_URL = env.API_URL;

const ACCESS_TOKEN_NAME = 'access_token';
const REFRESH_TOKEN_NAME = 'refresh_token';

export async function getTokens() {
  const cookieStore = await cookies();

  return {
    access: cookieStore.get(ACCESS_TOKEN_NAME)?.value,
    refresh: cookieStore.get(REFRESH_TOKEN_NAME)?.value,
  };
}

export async function login(req: NextRequest): Promise<Response> {
  const reqBody = (await req.json()) as LoginWithGoogleInput;

  const apiResponse = await djangoFetch('/accounts/google/', {
    shouldRefreshTokens: false,
    isProtected: false,
    method: 'POST',
    body: JSON.stringify({ token: reqBody.credentials }),
  });

  const { user } = (await apiResponse.json()) as {
    user: User;
  };
  const setCookie = apiResponse.headers.getSetCookie();
  const tokens = getTokensFromCookies(setCookie);

  if (!tokens) {
    return Response.json(null, {
      status: 500,
      statusText: 'Internal Sever Error',
    });
  }

  const res = NextResponse.json(user);
  await appendTokensSetCookiesToHeaders({ headers: res.headers, ...tokens });

  return res;
}

export async function logout() {
  try {
    await djangoFetch('/auth/logout/', {
      method: 'POST',
      shouldRefreshTokens: false,
    });
  } finally {
    const res = Response.json({ success: true });
    await appendDeleteTokensThroughSetCookies({ res });

    return res;
  }
}

export async function getMe() {
  return (await verifySession())
    ? await djangoFetch(`/auth/users/me/`)
    : Response.json(null);
}

export async function refreshTokens() {
  const { refresh } = await getTokens();
  const res = await fetch(`${API_URL}/auth/jwt/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) {
    throw new Error(
      `Token refresh failed: ${res.statusText} - ${await res.text()}`,
    );
  }

  const setCookies = res.headers.getSetCookie();
  const tokens = getTokensFromCookies(setCookies);

  if (!tokens) {
    throw new Error(
      'Tokens were not found in set-cookie header from refresh api.',
    );
  }

  return tokens;
}

export async function appendTokensSetCookiesToHeaders({
  access,
  refresh,
  headers,
}: {
  headers: Headers;
  access: string;
  refresh: string;
}) {
  const refreshMaxAge = 60 * 60 * 24 * 15;
  const accessMaxAge = 60 * 60;
  headers.append(
    'Set-Cookie',
    `${REFRESH_TOKEN_NAME}=${refresh}; Secure; HttpOnly; SameSite=None; Max-Age=${refreshMaxAge}; Path=/`,
  );
  headers.append(
    'Set-Cookie',
    `${ACCESS_TOKEN_NAME}=${access}; Secure; HttpOnly; SameSite=None; Max-Age=${accessMaxAge}; Path=/`,
  );
}

export async function appendDeleteTokensThroughSetCookies({
  res,
}: {
  res: Response;
}) {
  res.headers.append(
    'Set-Cookie',
    `${ACCESS_TOKEN_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`,
  );
  res.headers.append(
    'Set-Cookie',
    `${REFRESH_TOKEN_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`,
  );
}
