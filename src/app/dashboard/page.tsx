import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { redirect } from 'next/navigation';

import DashboardPage from '~/components/DashboardPage/DashboardPage';
import { getBots, getUser } from '~/lib/dal';
import { getQueryClient } from '~/lib/query-client';
import { botKeys, userKeys } from '~/lib/query-keys';

export default async function Page() {
  const user = await getUser();
  if (!user) {
    return redirect('/login');
  }

  const queryClient = getQueryClient();
  const bots = await getBots();
  await queryClient.setQueryData(userKeys.me(), user);
  await queryClient.setQueryData(botKeys.lists(), bots);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardPage />
    </HydrationBoundary>
  );
}
