import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { redirect } from 'next/navigation';

import { DashboardPage } from '~/components/DashboardPage/DashboardPage';
import { djangoFetch, verifySession } from '~/lib/django-fetch';
import { getQueryClient } from '~/lib/query-client';
import { botKeys, userKeys } from '~/lib/query-keys';

export default async function Page() {
  const session = await verifySession();
  if (!session) {
    return redirect('/login');
  }

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: userKeys.me(),
      queryFn: () => djangoFetch(`/auth/users/me/`).then((res) => res.json()),
    }),
    queryClient.prefetchQuery({
      queryKey: botKeys.lists(),
      queryFn: () => djangoFetch(`/bots/`).then((res) => res.json()),
    }),
  ]);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardPage />
    </HydrationBoundary>
  );
}
