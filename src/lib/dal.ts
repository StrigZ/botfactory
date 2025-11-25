'use server';

import { cache } from 'react';

import type { User } from '~/context/AuthContext';

import type { Bot } from './bot-api-client';
import { djangoFetch, verifySession } from './django-fetch';

export const fetchUser = cache(async () => {
  return await djangoFetch(`/auth/users/me/`);
});

export const getUser = cache(async () => {
  return (await verifySession())
    ? ((await fetchUser()).json() as unknown as User)
    : null;
});

export const fetchBots = cache(async () => {
  return await djangoFetch(`/bots/`);
});

export const getBots = cache(async () => {
  return (await verifySession())
    ? ((await fetchBots()).json() as unknown as Bot[])
    : null;
});
