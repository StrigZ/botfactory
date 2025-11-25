'use server';

import { fetchUser } from '~/lib/dal';
import { handleApiRequest } from '~/lib/django-fetch';

export async function GET() {
  return await handleApiRequest(fetchUser);
}
