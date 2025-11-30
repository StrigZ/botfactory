import {
  type UseQueryOptions,
  type UseQueryResult,
  useQuery,
} from '@tanstack/react-query';

import { useAuth } from '~/context/AuthContext';

/**
 * A wrapper around useQuery that ensures the query only runs after
 * the user authentication query has succeeded. This prevents multiple
 * queries from racing to refresh tokens when the access token is expired.
 *
 * The user query acts as a gatekeeper - once it succeeds, we know tokens
 * are valid and other queries can safely proceed.
 */
export function useAuthenticatedQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = readonly unknown[],
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): UseQueryResult<TData, TError> {
  const { isUserQueryFinished } = useAuth();

  return useQuery({
    ...options,
    enabled: isUserQueryFinished && (options.enabled ?? true),
  });
}
