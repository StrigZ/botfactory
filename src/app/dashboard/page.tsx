import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';

import DashboardPage from '~/components/DashboardPage/DashboardPage';
import { botsOptions } from '~/lib/bot-query-options';
import { getQueryClient } from '~/lib/query-client';

export default async function Page() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(botsOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <DashboardPage />
      </ThemeProvider>
    </HydrationBoundary>
  );
}
