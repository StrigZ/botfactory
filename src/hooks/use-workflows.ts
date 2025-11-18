'use client';

import { useQuery } from '@tanstack/react-query';

import { workflowKeys } from '~/lib/query-keys';
import { workflowApiClient } from '~/lib/workflow-api-client';

export function useWorkflowWithNodes({ id }: { id: string }) {
  return useQuery({
    queryKey: workflowKeys.detailWithNodes(id),
    queryFn: () => workflowApiClient.getByIdWithNodes(id),
    enabled: !!id,
  });
}
