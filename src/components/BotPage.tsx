'use client';

import { Suspense } from 'react';

import { api } from '~/trpc/react';

import CreateOrUpdateForm from './CreateOrUpdateForm';
import LoadingSpinner from './LoadingSpinner';

type Props = { botId: string };
export default function BotPage({ botId }: Props) {
  const [botData, { isLoading }] = api.bot.getById.useSuspenseQuery({
    id: botId,
  });

  return (
    <div className="flex h-full overflow-hidden">
      <div className="min-w-xs p-8">
        <Suspense fallback={<LoadingSpinner />}>
          <CreateOrUpdateForm botData={botData} isLoading={isLoading} />
        </Suspense>
      </div>
      <div className="flex-1 bg-red-300"></div>
    </div>
  );
}
