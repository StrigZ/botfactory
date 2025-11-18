'use client';

import { useQuery } from '@tanstack/react-query';

import { botApiClient } from '~/lib/bot-api-client';
import { botKeys } from '~/lib/query-keys';

export function useBot({ id }: { id: string }) {
  return useQuery({
    queryKey: botKeys.detail(id),
    queryFn: () => botApiClient.getById(id),
    enabled: !!id,
  });
}

export function useBots() {
  return useQuery({
    queryKey: botKeys.details(),
    queryFn: () => botApiClient.getAll(),
  });
}
