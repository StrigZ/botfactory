'use server';

import { cache } from 'react';

import type { User } from '~/context/AuthContext';

import { djangoFetch } from './django-fetch';

export const getUser = cache(async () => {
  const res = await djangoFetch(`/auth/users/me/`);
  const user = (await res.json()) as User;

  return user;
});
