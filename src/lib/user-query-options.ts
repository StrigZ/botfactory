import { queryOptions } from '@tanstack/react-query';

import type { User } from '~/context/AuthContext';

import { userKeys } from './query-keys';
import { userApiClient } from './user-api-client';

export const userOptions = ({ initialUser }: { initialUser?: User | null }) =>
  queryOptions({
    queryKey: userKeys.me(),
    queryFn: () => userApiClient.getMe(),
    initialData: initialUser,
  });
