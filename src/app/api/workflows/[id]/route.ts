import type { NextRequest } from 'next/server';

import { djangoFetch } from '~/lib/django-fetch';

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const { id } = await params;

  return await djangoFetch(`/workflows/bot/${id}/full/`);
}

export async function PUT(request: NextRequest) {
  return await djangoFetch(`/workflows/sync/`, {
    method: 'PUT',
    body: JSON.stringify(await request.json()),
  });
}
