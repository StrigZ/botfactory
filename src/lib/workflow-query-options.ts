import { queryOptions } from '@tanstack/react-query';

import { workflowKeys } from './query-keys';
import { workflowApiClient } from './workflow-api-client';

export const workflowOptions = ({ id }: { id: string }) =>
  queryOptions({
    queryKey: workflowKeys.detailWithNodes(id),
    queryFn: () => workflowApiClient.getByIdWithNodes(id),
    enabled: !!id,
  });
