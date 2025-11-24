'use server';

import { cache } from 'react';

import type { User } from '~/context/AuthContext';

import type { Bot } from './bot-api-client';
import { djangoFetch, verifySession } from './django-fetch';

export const getUser = cache(async () => {
  const session = await verifySession();
  if (!session) {
    return null;
  }
  const res = await djangoFetch(`/auth/users/me/`);
  const user = (await res.json()) as User;

  return user;
});

export const getBots = cache(async () => {
  const res = await djangoFetch(`/bots/`);
  const bots = (await res.json()) as Bot[];

  return bots;
});
