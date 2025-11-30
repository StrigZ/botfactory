import type { NextRequest } from 'next/server';

import { djangoFetch } from '~/lib/django-fetch';

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const { id } = await params;

  return await djangoFetch(`/bots/${id}/`);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const { id } = await params;

  return await djangoFetch(`/bots/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(await request.json()),
  });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const { id } = await params;

  return await djangoFetch(`/bots/${id}/`, { method: 'DELETE' });
}
