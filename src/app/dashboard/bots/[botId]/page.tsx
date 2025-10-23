import { ThemeProvider } from 'next-themes';

import BotPage from '~/components/BotPage/BotPage';
import { api } from '~/trpc/server';

export default async function Page({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;
  await api.bot.getById.prefetch({ id: botId });
  await api.workflow.getByBotId.prefetch({ id: botId });

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <BotPage botId={botId} />
    </ThemeProvider>
  );
}
