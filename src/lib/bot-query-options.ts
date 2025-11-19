import { queryOptions } from '@tanstack/react-query';

import { botApiClient } from './bot-api-client';
import { botKeys } from './query-keys';

export const botOptions = ({ id }: { id: string }) =>
  queryOptions({
    queryKey: botKeys.detail(id),
    queryFn: () => botApiClient.getById(id),
    enabled: !!id,
  });

export const botsOptions = () =>
  queryOptions({
    queryKey: botKeys.lists(),
    queryFn: () => botApiClient.getAll(),
  });
