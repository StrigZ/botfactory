import LandingPage from '~/components/LandingPage/LandingPage';
import LandingPageContextProvider from '~/context/LandingPageContext';

export default async function Page() {
  return (
    <LandingPageContextProvider>
      <LandingPage />
    </LandingPageContextProvider>
  );
}
