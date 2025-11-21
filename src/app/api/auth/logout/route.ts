'use server';

import { logout } from '~/lib/auth';
import { djangoFetch } from '~/lib/django-fetch';

export async function POST() {
  try {
    const res = await djangoFetch('/auth/logout/', {
      method: 'POST',
    });
    await logout();

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
