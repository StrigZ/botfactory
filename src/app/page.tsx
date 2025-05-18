import LandingPage from '~/components/LandingPage/LandingPage';
import LandingPageContextProvider from '~/context/LandingPageContext';
import { auth } from '~/server/auth';
import { HydrateClient } from '~/trpc/server';

export default async function Landing() {
  return (
    <HydrateClient>
      <LandingPageContextProvider>
        <LandingPage />
      </LandingPageContextProvider>
    </HydrateClient>
  );
}
