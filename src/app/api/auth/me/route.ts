'use server';

import { cookies, headers } from 'next/headers';
import type { NextRequest } from 'next/server';

import type { User } from '~/context/AuthContext';
import { getTokens, saveTokensFromCookie, setTokens } from '~/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

type RefreshResponseData = {
  access: string;
};
type MeResponseData = {
  user: User;
};

export async function GET(request: NextRequest) {
  try {
    const { access, refresh } = await getTokens();
    if (!access && refresh) {
      try {
        const res = await fetch(`${API_URL}/auth/jwt/refresh/`, {
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
      } catch (e) {
        console.error(e);
        return Response.json({ status: 500, statusText: (e as Error).message });
      }
    }

    const requestOption: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access ?? (await getTokens()).access}`,
      },
    };
    const res = await fetch(`${API_URL}/auth/users/me/`, requestOption);

    if (!res.ok) {
      console.error(await res.text());
      throw new Error(
        'Error during /auth/users/me/ api call: ' + res.statusText,
      );
    }

    const data = (await res.json()) as MeResponseData;
    return Response.json({ ...data }, { status: 200 });
  } catch (e) {
    console.error(e);
    return Response.json({ status: 500, statusText: (e as Error).message });
  }
}
