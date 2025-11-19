import DashboardPage from '~/components/DashboardPage/DashboardPage';
import { botsOptions } from '~/lib/bot-query-options';
import { getQueryClient } from '~/lib/query-client';

export default async function Page() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(botsOptions());

  return <DashboardPage />;
}
