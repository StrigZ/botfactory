'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';

import type { User } from '~/context/AuthContext';
import { env } from '~/env';

import { getTokens, refreshToken } from './auth';

export const verifySession = cache(async () => {
  const { access, refresh } = await getTokens();
  if (!access && refresh) {
    await refreshToken();
  }

  const newAccess = access ?? (await getTokens()).access;

  if (!newAccess) {
    return redirect('/login');
  }

  return { isAuth: true, access: newAccess, refresh };
});

export const getUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;

  try {
    const requestOption: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        Cookie: (await cookies()).toString(),
      },
      credentials: 'include',
    };
    const res = await fetch(`${env.API_URL}/auth/users/me/`, requestOption);

    if (!res.ok) {
      console.error(await res.text());
      throw new Error(
        'Error during /auth/users/me/ api call: ' + res.statusText,
      );
    }

    return { ...(await res.json()) } as User;
  } catch (e) {
    console.error(e);
    throw e;
  }
});
