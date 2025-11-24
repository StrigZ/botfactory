'use server';

import { cookies } from 'next/headers';

import { env } from '~/env';

import { getTokens, refreshTokens, setTokens } from './auth';

const API_URL = env.API_URL;

export async function djangoFetch(
  endpoint: string,
  fetchOptions: RequestInit = {},
) {
  const session = await verifySession();

  if (!session) {
    const error = new Error('Unauthorized - no valid session') as Error & {
      status?: number;
    };
    error.status = 401;
    throw error;
  }

  let tokens = await getTokens();
  let cookieHeader = (await cookies()).toString();

  const makeRequest = async () =>
    await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
        Authorization: `Bearer ${tokens.access}`,
        Cookie: cookieHeader,
      },
    });
  let res = await makeRequest();

  if (res.status === 401) {
    try {
      const refreshedTokens = await refreshTokens();

      await setTokens(refreshedTokens);
      tokens = refreshedTokens;
      cookieHeader = (await cookies()).toString();

      res = await makeRequest();
    } catch (e) {
      console.error('Token refresh failed: ', e);
      throw e;
    }
  } else if (!res.ok) {
    throw new Error(
      `${endpoint} call failed: ` + (res.statusText ?? (await res.text())),
    );
  }

  return res;
}

export const verifySession = async () => {
  const { refresh } = await getTokens();

  return !!refresh;
};

export async function handleApiRequest<T>(req: () => Promise<T>) {
  try {
    const data = await req();

    return Response.json(data ?? null);
  } catch (e) {
    console.error(e);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const status = (e as any).status ?? 500;
    const message = (e as Error).message ?? 'Internal server error';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return Response.json({ error: message }, { status, statusText: message });
  }
}
