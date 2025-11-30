'use client';

import { useQuery } from '@tanstack/react-query';

import { userOptions } from '~/lib/user-query-options';

export function useUser() {
  return useQuery(userOptions());
}
