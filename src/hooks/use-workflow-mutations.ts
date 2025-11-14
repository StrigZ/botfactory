'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getQueryClient } from '~/lib/query-client';
import {
  type UpdateWorkflowInput,
  workflowApiClient,
} from '~/lib/workflow-api-client';

import { workflowKeys } from './use-workflows';

export function useWorkflowMutations() {
  const queryClient = getQueryClient();

  const updateWorkflowMutation = useMutation({
    mutationFn: ({ id, nodes, edges }: UpdateWorkflowInput) =>
      workflowApiClient.update({ id, nodes, edges }),
    onSuccess: async (data, variables) => {
      await queryClient.setQueryData(
        workflowKeys.detailWithNodes(variables.id),
        data,
      );
      toast.success('Workflow updated successfully');
    },
    onError: ({ message }) => toast.error(message),
  });

  return {
    updateWorkflow: updateWorkflowMutation.mutate,
    isUpdating: updateWorkflowMutation.isPending,
  };
}
