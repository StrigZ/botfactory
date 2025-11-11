import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import LandingPage from '~/components/LandingPage/LandingPage';
import LandingPageContextProvider from '~/context/LandingPageContext';
import { getQueryClient } from '~/lib/query-client';

export default async function Page() {
  const queryClient = getQueryClient();

  // void queryClient.prefetchQuery(pokemonOptions);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LandingPageContextProvider>
        <LandingPage />
      </LandingPageContextProvider>
    </HydrationBoundary>
  );
}
