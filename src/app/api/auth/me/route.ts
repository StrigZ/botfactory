'use server';

import type { User } from '~/context/AuthContext';
import { getUser } from '~/lib/dal';
import { handleApiRequest } from '~/lib/django-fetch';

export async function GET() {
  return await handleApiRequest<User>(getUser);
}
