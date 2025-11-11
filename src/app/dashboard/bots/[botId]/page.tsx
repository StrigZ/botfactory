import { ThemeProvider } from 'next-themes';

import BotPage from '~/components/BotPage/BotPage';
import { botKeys } from '~/hooks/use-bots';
import { getQueryClient } from '~/lib/query-client';
import { api } from '~/trpc/server';

export default async function Page({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const queryClient = getQueryClient();
  const { botId } = await params;

  await queryClient.prefetchQuery({
    queryKey: botKeys.detail(botId),
  });
  // TODO:replace with workflow mutation
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
