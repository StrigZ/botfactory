import { ThemeProvider } from 'next-themes';

import BotPage from '~/components/BotPage/BotPage';

export default async function Page() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <BotPage />
    </ThemeProvider>
  );
}
