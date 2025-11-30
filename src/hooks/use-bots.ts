'use client';

import { botOptions, botsOptions } from '~/lib/bot-query-options';

import { useAuthenticatedQuery } from './use-authenticated-query';

export function useBot({ id }: { id: string }) {
  return useAuthenticatedQuery(botOptions({ id }));
}

export function useBots() {
  return useAuthenticatedQuery(botsOptions());
}
