'use client';

import { Suspense } from 'react';

import DnDContextProvider from '~/context/DnDContext';
import ReactFlowContextProvider from '~/context/ReactFlowContext';
import { withAuth } from '~/hooks/use-auth';
import { useBot } from '~/hooks/use-bots';
import { useWorkflowWithNodes } from '~/hooks/use-workflows';

import LoadingSpinner from '../LoadingSpinner';
import UpdateBotForm from '../UpdateBotForm';
import Workflow from './Workflow/Workflow';

type Props = { botId: string };
function BotDetailsPage({ botId }: Props) {
  const { data: botData } = useBot({ id: botId });
  const { data: workflow } = useWorkflowWithNodes({ id: botId });

  return (
    <div className="flex h-full overflow-hidden p-0">
      <div className="min-w-xs p-8">
        <Suspense fallback={<LoadingSpinner />}>
          <UpdateBotForm botData={botData} />
        </Suspense>
      </div>

      <div className="relative flex-1">
        <ReactFlowContextProvider workflow={workflow}>
          <DnDContextProvider>
            <Workflow isEnabled={!!botData} />
          </DnDContextProvider>
        </ReactFlowContextProvider>
      </div>
    </div>
  );
}

export default withAuth(BotDetailsPage);
