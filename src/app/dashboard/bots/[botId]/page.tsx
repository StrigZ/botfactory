import { ThemeProvider } from 'next-themes';

import BotPage from '~/components/BotPage/BotPage';
import { botKeys } from '~/hooks/use-bots';
import { workflowKeys } from '~/hooks/use-workflows';
import { getQueryClient } from '~/lib/query-client';

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
  await queryClient.prefetchQuery({
    queryKey: workflowKeys.detailWithNodes(botId),
  });

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
