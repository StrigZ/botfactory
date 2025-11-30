'use client';

import { workflowOptions } from '~/lib/workflow-query-options';

import { useAuthenticatedQuery } from './use-authenticated-query';

export function useWorkflowWithNodes({ id }: { id: string }) {
  return useAuthenticatedQuery(workflowOptions({ id }));
}
