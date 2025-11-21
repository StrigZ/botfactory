'use server';

import { cookies } from 'next/headers';
import { cache } from 'react';

import { env } from '~/env';

import { getTokens, refreshTokens, setTokens } from './auth';

const API_URL = env.API_URL;

export async function djangoFetch(
  endpoint: string,
  fetchOptions: RequestInit = {},
) {
  const session = await verifySession();
  if (!session) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const error: any = new Error('Unauthorized - no valid session');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    error.status = 401;
    throw error;
  }

  const makeRequest = async () =>
    await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
        Authorization: `Bearer ${(await getTokens()).access}`,
        Cookie: (await cookies()).toString(),
      },
    });
  let res = await makeRequest();

  if (res.status === 401) {
    try {
      const tokens = await refreshTokens();
      await setTokens(tokens);

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

export const verifySession = cache(async () => {
  const { refresh } = await getTokens();

  return !!refresh;
});

export async function handleApiRequest<T>(req: () => Promise<T>) {
  try {
    const data = await req();

    if (!data) {
      return Response.json({});
    }

    return Response.json(data);
  } catch (e) {
    console.error(e);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const status = (e as any).status ?? 500;
    const message = (e as Error).message ?? 'Internal server error';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return Response.json({ error: message }, { status, statusText: message });
  }
}
