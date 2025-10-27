'use server';

import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

import type { User } from '~/context/AuthContext';
import { env } from '~/env';

const API_URL = env.API_URL ?? 'http://localhost:3000';

type MeResponseData = {
  user: User;
};

export async function GET(request: NextRequest) {
  try {
    const requestOption: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        Cookie: (await cookies()).toString(),
      },
      credentials: 'include',
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
    throw e;
  }
}
