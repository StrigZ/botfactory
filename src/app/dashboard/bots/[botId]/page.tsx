import BotPage from '~/components/BotPage/BotPage';
import { botOptions } from '~/lib/bot-query-options';
import { getQueryClient } from '~/lib/query-client';
import { workflowOptions } from '~/lib/workflow-query-options';

export default async function Page({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const queryClient = getQueryClient();
  const { botId } = await params;

  await queryClient.prefetchQuery(botOptions({ id: botId }));
  await queryClient.prefetchQuery(workflowOptions({ id: botId }));

  return <BotPage botId={botId} />;
}
