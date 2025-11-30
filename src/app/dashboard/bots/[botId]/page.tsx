import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { BotDetailsPage } from '~/components/BotPage/BotDetailsPage';
import { djangoFetch } from '~/lib/django-fetch';
import { getQueryClient } from '~/lib/query-client';
import { botKeys, workflowKeys } from '~/lib/query-keys';

export default async function Page({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const queryClient = getQueryClient();
  const { botId } = await params;

  await queryClient.prefetchQuery({
    queryKey: botKeys.detail(botId),
    queryFn: () =>
      djangoFetch(`/bots/${botId}/`, { shouldRefreshTokens: false }).then(
        (res) => res.json(),
      ),
  });
  await queryClient.prefetchQuery({
    queryKey: workflowKeys.detailWithNodes(botId),
    queryFn: () =>
      djangoFetch(`/workflows/bot/${botId}/full/`, {
        shouldRefreshTokens: false,
      }).then((res) => res.json()),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BotDetailsPage botId={botId} />
    </HydrationBoundary>
  );
}
