'use server';

import { getMe } from '~/lib/auth';

export async function GET() {
  return await getMe();
}
