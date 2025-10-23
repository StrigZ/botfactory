import { ThemeProvider } from 'next-themes';

import DashboardPage from '~/components/DashboardPage/DashboardPage';

export default async function Page() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <DashboardPage />
    </ThemeProvider>
  );
}
