import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { redirect } from 'next/navigation';

import DashboardPage from '~/components/DashboardPage/DashboardPage';
import { getBots, getUser } from '~/lib/dal';
import { verifySession } from '~/lib/django-fetch';
import { getQueryClient } from '~/lib/query-client';
import { botKeys, userKeys } from '~/lib/query-keys';

export default async function Page() {
  const session = await verifySession();
  if (!session) {
    return redirect('/login');
  }

  const queryClient = getQueryClient();
  // const user = await getUser();
  // const bots = await getBots();
  // await queryClient.setQueryData(userKeys.me(), user);
  // await queryClient.setQueryData(botKeys.lists(), bots);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardPage />
    </HydrationBoundary>
  );
}
