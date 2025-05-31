'use client';

import { api } from '~/trpc/react';

import CreateOrUpdateForm from './CreateOrUpdateForm';

type Props = { botId: string };
export default function BotPage({ botId }: Props) {
  const { data: botData, isLoading: isBotDataLoading } =
    api.bot.getById.useQuery({
      id: botId,
    });

  return (
    <div className="flex h-full overflow-hidden">
      <div className="min-w-xs p-8">
        <CreateOrUpdateForm botData={botData} isLoading={isBotDataLoading} />
      </div>
      <div className="flex-1 bg-red-300"></div>
    </div>
  );
}
