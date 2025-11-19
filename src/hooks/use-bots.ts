'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { botOptions, botsOptions } from '~/lib/bot-query-options';

export function useBot({ id }: { id: string }) {
  return useSuspenseQuery(botOptions({ id }));
}

export function useBots() {
  return useSuspenseQuery(botsOptions());
}
