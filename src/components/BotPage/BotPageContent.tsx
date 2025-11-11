'use client';

import { Suspense } from 'react';

import { useBot } from '~/hooks/use-bots';

import CreateOrUpdateForm from '../CreateOrUpdateForm';
import LoadingSpinner from '../LoadingSpinner';
import Workflow from './Workflow/Workflow';

type Props = { botId?: string };
export default function BotPageContent({ botId }: Props) {
  const { data: botData } = useBot({ id: botId! });
  return (
    <div className="flex h-full overflow-hidden p-0">
      <div className="min-w-xs p-8">
        <Suspense fallback={<LoadingSpinner />}>
          <CreateOrUpdateForm botData={botData} isEditableByDefault={!botId} />
        </Suspense>
      </div>
      <Workflow isEnabled={!!botData} />
    </div>
  );
}
