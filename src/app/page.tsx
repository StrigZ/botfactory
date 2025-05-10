import LandingPage from '~/components/LandingPage/LandingPage';
import LandingPageContextProvider from '~/context/LandingPageContext';
import { auth } from '~/server/auth';
import { HydrateClient, api } from '~/trpc/server';

export default async function Landing() {
  const hello = await api.post.hello({ text: 'from tRPC' });
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <LandingPageContextProvider>
        <LandingPage />
      </LandingPageContextProvider>
    </HydrateClient>
  );
}
