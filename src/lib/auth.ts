'use server';

import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { cookies } from 'next/headers';

import { env } from '~/env';

import { djangoFetch } from './django-fetch';
import { getApiUrl, getTokensFromCookies } from './utils';

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

export async function setTokens({
  access,
  refresh,
}: {
  access: string;
  refresh: string;
}) {
  const cookieStore = await cookies();
  const tokenCookieSettings: Omit<ResponseCookie, 'name' | 'value'> = {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    path: '/',
  };

  cookieStore.set(ACCESS_TOKEN_NAME, access, {
    ...tokenCookieSettings,
    maxAge: 60 * 60,
  });

  cookieStore.set(REFRESH_TOKEN_NAME, refresh, {
    ...tokenCookieSettings,
    maxAge: 60 * 60 * 24 * 15,
  });
}

export async function logout() {
  try {
    return await djangoFetch('/auth/logout/', {
      method: 'POST',
    });
  } finally {
    (await cookies()).set(ACCESS_TOKEN_NAME, '', { expires: new Date(0) });
    (await cookies()).set(REFRESH_TOKEN_NAME, '', { expires: new Date(0) });
  }
}

export async function refreshTokens() {
  const { refresh } = await getTokens();
  return await fetch(getApiUrl('/api/auth/refresh'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookies: (await cookies()).toString(),
    },
    body: JSON.stringify({ refresh }),
  });
}

export async function appendTokensSetCookiesToResponse({
  access,
  refresh,
  res,
}: {
  res: Response;
  access: string;
  refresh: string;
}) {
  const refreshMaxAge = 60 * 60 * 24 * 15;
  const accessMaxAge = 60 * 60;
  res.headers.append(
    'Set-Cookie',
    `refresh_token=${refresh}; Secure; HttpOnly; SameSite=None; Max-Age=${refreshMaxAge}; Path=/`,
  );
  res.headers.append(
    'Set-Cookie',
    `access_token=${access}; Secure; HttpOnly; SameSite=None; Max-Age=${accessMaxAge}; Path=/`,
  );
}
