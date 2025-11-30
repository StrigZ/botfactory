import type { NextRequest } from 'next/server';

import { fetchBots } from '~/lib/dal';
import { djangoFetch, handleApiRequest } from '~/lib/django-fetch';

export async function POST(request: NextRequest) {
  return await djangoFetch('/bots/', {
    method: 'POST',
    body: JSON.stringify(await request.json()),
  });
}

export async function GET() {
  return await handleApiRequest(fetchBots);
}
