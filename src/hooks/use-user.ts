'use client';

import { useQuery } from '@tanstack/react-query';

import type { User } from '~/context/AuthContext';
import { userOptions } from '~/lib/user-query-options';

export function useUser({ initialUser }: { initialUser?: User | null }) {
  return useQuery(userOptions({ initialUser }));
}
