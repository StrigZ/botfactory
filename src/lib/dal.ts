'use server';

import { cache } from 'react';

import type { Bot } from './bot-api-client';
import { djangoFetch, verifySession } from './django-fetch';

export const fetchBots = cache(async () => {
  return await djangoFetch(`/bots/`);
});

export const getBots = cache(async () => {
  return (await verifySession())
    ? ((await fetchBots()).json() as unknown as Bot[])
    : null;
});
