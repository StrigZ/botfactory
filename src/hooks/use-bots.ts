'use client';

import { useQuery } from '@tanstack/react-query';

import { botOptions, botsOptions } from '~/lib/bot-query-options';

export function useBot({ id }: { id: string }) {
  return useQuery(botOptions({ id }));
}

export function useBots() {
  return useQuery(botsOptions());
}
