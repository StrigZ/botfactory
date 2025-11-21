'use server';

import { cookies } from 'next/headers';

import { env } from '~/env';

import { getTokens, refreshTokens, setTokens } from './auth';

const API_URL = env.API_URL;

export async function djangoFetch(
  endpoint: string,
  fetchOptions: RequestInit = {},
) {
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
  }

  return res;
}
