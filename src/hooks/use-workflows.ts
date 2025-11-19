'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { workflowOptions } from '~/lib/workflow-query-options';

export function useWorkflowWithNodes({ id }: { id: string }) {
  return useSuspenseQuery(workflowOptions({ id }));
}
