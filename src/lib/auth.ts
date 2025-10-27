'use server';

import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { cookies } from 'next/headers';

import { env } from '~/env';

const ACCESS_TOKEN_NAME = 'access_token';
const REFRESH_TOKEN_NAME = 'refresh_token';

export async function getTokens() {
  const cookieStore = await cookies();

  return {
    access: cookieStore.get(ACCESS_TOKEN_NAME)?.value,
    refresh: cookieStore.get(REFRESH_TOKEN_NAME)?.value,
  };
}

export async function saveTokensFromCookie(cookies: string[]) {
  let accessToken: string | undefined = undefined;
  let refreshToken: string | undefined = undefined;

  cookies.forEach((cookie) => {
    const accessMatch = /(?:access_token|access)=([^;]+)/.exec(cookie);
    if (accessMatch) {
      accessToken = accessMatch[1];
    }

    const refreshMatch = /(?:refresh_token|refresh)=([^;]+)/.exec(cookie);
    if (refreshMatch) {
      refreshToken = refreshMatch[1];
    }
  });

  if (!accessToken || !refreshToken) {
    throw new Error('Tokens not found in cookies');
  }

  await setTokens({ access: accessToken, refresh: refreshToken });
}

export async function setTokens({
  access,
  refresh,
}: {
  access?: string;
  refresh?: string;
}) {
  const cookieStore = await cookies();
  const tokenCookieSettings: Omit<ResponseCookie, 'name' | 'value'> = {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    path: '/',
  };

  if (access) {
    cookieStore.set(ACCESS_TOKEN_NAME, access, {
      ...tokenCookieSettings,
      maxAge: 60 * 60,
    });
  }

  if (refresh) {
    cookieStore.set(REFRESH_TOKEN_NAME, refresh, {
      ...tokenCookieSettings,
      maxAge: 60 * 60 * 24 * 15,
    });
  }
}

export async function deleteTokens() {
  (await cookies()).set(ACCESS_TOKEN_NAME, '', { expires: new Date(0) });
  (await cookies()).set(REFRESH_TOKEN_NAME, '', { expires: new Date(0) });
}

export async function refreshToken() {
  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/auth/jwt/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: (await cookies()).toString(),
    },
    credentials: 'include',
  });
  if (!res.ok) {
    console.error(await res.text());
    throw new Error(
      'Error during token refreshing api call: ' + res.statusText,
    );
  }
  const resCookies = res.headers.getSetCookie();
  await saveTokensFromCookie(resCookies);
}
