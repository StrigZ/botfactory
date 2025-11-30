import type { NextRequest } from 'next/server';

import { djangoFetch } from '~/lib/django-fetch';

export async function POST(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const { id } = await params;

  return await djangoFetch(`/bots/${id}/deploy/`, { method: 'POST' });
}
