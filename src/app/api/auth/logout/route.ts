'use server';

import { env } from '~/env';
import { deleteTokens, getTokens } from '~/lib/auth';

const API_URL = env.API_URL ?? 'http://localhost:3000';

export async function POST(request: Request) {
  const { access } = await getTokens();
  await deleteTokens();

  try {
    const requestOption: RequestInit = {
      method: 'POST',
      headers: { Authorization: `Bearer ${access}` },
      credentials: 'include',
    };
    const res = await fetch(`${API_URL}/auth/logout/`, requestOption);
    if (!res.ok) {
      throw new Error(
        'Error during /auth/users/logout/ api call: ' + res.statusText,
      );
    }

    return Response.json({}, { status: 200 });
  } catch (e) {
    console.error(e);
    throw e;
  }
}
