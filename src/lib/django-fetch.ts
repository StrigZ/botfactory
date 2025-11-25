'use server';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { env } from '~/env';

import { getTokens, refreshTokens } from './auth';

const API_URL = env.API_URL;

export async function djangoFetch(
  endpoint: string,
  fetchOptions: RequestInit & { isProtected?: boolean } = {
    isProtected: true,
  },
) {
  const session = await verifySession();
  const { isProtected } = fetchOptions;

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
      ...fetchOptions.headers,
      Authorization: `Bearer ${(await getTokens()).access}`,
      Cookie: (await cookies()).toString(),
    },
  });

  if (res.status === 401) {
    try {
      const refreshRes = await refreshTokens();

      // const setCookies = refreshRes.headers.getSetCookie();
      const tokens = (await refreshRes.json()) as {
        access: string;
        refresh: string;
      };
      if (!tokens) {
        throw new Error('Tokens were not found!');
      }

      const { access, refresh } = tokens;

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
      // res.headers.set('Set-Cookie', setCookies.toString());
      res.headers.append(
        'Set-Cookie',
        `refresh_token=${refresh}; Secure; HttpOnly; SameSite=None; Max-Age=7200; Path=/`,
      );
      res.headers.append(
        'Set-Cookie',
        `access_token=${access}; Secure; HttpOnly; SameSite=None; Max-Age=25600; Path=/`,
      );
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

export async function handleApiRequest(req: () => Promise<Response | void>) {
  try {
    // const apiResponse = await req();
    // if (!apiResponse) {
    //   throw new Error('Internal server error');
    // }

    // const res = new NextResponse();

    // const setCookie = apiResponse.headers.getSetCookie();
    // res.headers.set('Set-Cookie', setCookie.toString());

    // const data = (await apiResponse.json()) as T;

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
