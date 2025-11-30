import { queryOptions } from '@tanstack/react-query';

import { userKeys } from './query-keys';
import { userApiClient } from './user-api-client';

export const userOptions = () =>
  queryOptions({
    queryKey: userKeys.me(),
    queryFn: () => userApiClient.getMe(),
  });
