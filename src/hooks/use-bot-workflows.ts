'use client';

import { useQuery } from '@tanstack/react-query';

import { botWorkflowApiClient } from '~/lib/bot-workflow-api-client';

export const botWorkflowKeys = {
  all: ['botWorkflows'] as const,
  details: () => [...botWorkflowKeys.all, 'detail'] as const,
  detail: (id: string) => [...botWorkflowKeys.details(), id] as const,
  detailsWithNodes: () => [...botWorkflowKeys.all, 'detailWithNodes'] as const,
  detailWithNodes: (id: string) =>
    [...botWorkflowKeys.detailsWithNodes(), id] as const,
};

export function useBotWorkflow({ id }: { id: string }) {
  return useQuery({
    queryKey: botWorkflowKeys.detail(id),
    queryFn: () => botWorkflowApiClient.getById(id),
  });
}

export function useBotWorkflowWithNodes({ id }: { id: string }) {
  return useQuery({
    queryKey: botWorkflowKeys.detailWithNodes(id),
    queryFn: () => botWorkflowApiClient.getByIdWithNodes(id),
  });
}
