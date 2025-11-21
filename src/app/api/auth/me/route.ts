'use server';

import type { User } from '~/context/AuthContext';
import { djangoFetch } from '~/lib/django-fetch';

export async function GET() {
  try {
    const res = await djangoFetch(`/auth/users/me/`);

    if (!res.ok) {
      console.error(await res.text());
      throw new Error(
        'Error during /auth/users/me/ api call: ' + res.statusText,
      );
    }
    const user = (await res.json()) as User;

    return Response.json(user);
  } catch (e) {
    console.error(e);
    return Response.json({}, { status: 500 });
  }
}
