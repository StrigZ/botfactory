'use client';

import { useQuery } from '@tanstack/react-query';

import { botApiClient } from '~/lib/bot-api-client';

export const botKeys = {
  all: ['bots'] as const,
  lists: () => [...botKeys.all, 'list'] as const,
  //   list: (filters) => [...botKeys.lists(), { filters }] as const,
  details: () => [...botKeys.all, 'detail'] as const,
  detail: (id: string) => [...botKeys.details(), id] as const,
};

export function useBot({ id }: { id: string }) {
  return useQuery({
    queryKey: botKeys.detail(id),
    queryFn: () => botApiClient.getById(id),
  });
}

export function useBots() {
  return useQuery({
    queryKey: botKeys.details(),
    queryFn: () => botApiClient.getAll(),
  });
}
