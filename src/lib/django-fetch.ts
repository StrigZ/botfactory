'use server';

import { cookies } from 'next/headers';

import { env } from '~/env';

import {
  appendTokensSetCookiesToHeaders,
  getTokens,
  refreshTokens,
} from './auth';

const API_URL = env.API_URL;

type FetchOption = RequestInit & {
  isProtected?: boolean;
  shouldRefreshTokens?: boolean;
};

export async function djangoFetch(
  endpoint: string,
  fetchOptions: FetchOption = { shouldRefreshTokens: true, isProtected: true },
) {
  let isRetried = false;
  let newAccess = null;
  let newRefresh = null;
  const session = await verifySession();

  const { isProtected = true, shouldRefreshTokens = true } = fetchOptions;

  if (isProtected && !session) {
    const error = new Error('Unauthorized - no valid session') as Error & {
      status?: number;
    };
    error.status = 401;
    throw error;
  }

  let res = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${(await getTokens()).access}`,
      Cookie: (await cookies()).toString(),
      ...fetchOptions.headers,
    },
  });
  if (res.status === 401 && shouldRefreshTokens) {
    console.log('Refreshing tokens...');
    try {
      const { access, refresh } = await refreshTokens();
      [newAccess, newRefresh] = [access, refresh];

      res = await fetch(`${API_URL}${endpoint}`, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
          Authorization: `Bearer ${access}`,
          Cookie: JSON.stringify({
            refresh_token: refresh,
            access_token: access,
          }),
        },
      });
      isRetried = true;
    } catch (e) {
      console.error('Token refresh failed: ', e);
      throw e;
    }
  } else if (!res.ok) {
    throw new Error(
      `${endpoint} call failed: ` + (res.statusText ?? (await res.text())),
    );
  }

  const headers = new Headers(res.headers);

  if (isRetried && newAccess && newRefresh) {
    await appendTokensSetCookiesToHeaders({
      access: newAccess,
      refresh: newRefresh,
      headers,
    });
  }

  const newRes = Response.json(await res.json(), {
    status: res.status,
    statusText: res.statusText,
    headers,
  });

  return newRes;
}

export const verifySession = async () => {
  const { refresh } = await getTokens();

  return !!refresh;
};

export async function handleApiRequest(req: () => Promise<Response | void>) {
  try {
    return await req();
  } catch (e) {
    console.error(e);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const status = (e as any).status ?? 500;
    const message = (e as Error).message ?? 'Internal server error';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return Response.json({ error: message }, { status, statusText: message });
  }
}
