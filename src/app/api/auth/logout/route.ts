'use server';

import { logout } from '~/lib/auth';
import { handleApiRequest } from '~/lib/django-fetch';

export async function POST() {
  return await handleApiRequest(logout);
}
