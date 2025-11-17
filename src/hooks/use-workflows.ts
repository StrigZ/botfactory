'use client';

import { useQuery } from '@tanstack/react-query';

import { workflowApiClient } from '~/lib/workflow-api-client';

export const workflowKeys = {
  all: ['workflows'] as const,
  details: () => [...workflowKeys.all, 'detail'] as const,
  detail: (id: string) => [...workflowKeys.details(), id] as const,
  detailsWithNodes: () => [...workflowKeys.all, 'detailWithNodes'] as const,
  detailWithNodes: (id: string) =>
    [...workflowKeys.detailsWithNodes(), id] as const,
};

export function useWorkflowWithNodes({ id }: { id: string }) {
  return useQuery({
    queryKey: workflowKeys.detailWithNodes(id),
    queryFn: () => workflowApiClient.getByIdWithNodes(id),
    enabled: !!id,
  });
}
