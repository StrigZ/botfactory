'use client';

import { Suspense } from 'react';

import DnDContextProvider from '~/context/DnDContext';
import ReactFlowContextProvider from '~/context/ReactFlowContext';
import { withAuth } from '~/hooks/use-auth';
import { useBot } from '~/hooks/use-bots';
import { useWorkflowWithNodes } from '~/hooks/use-workflows';

import LoadingSpinner from '../LoadingSpinner';
import SingleFieldFormWrapper from '../SingleFieldFormWrapper';
import Workflow from './Workflow/Workflow';

type Props = { botId: string };
function BotDetailsPage({ botId }: Props) {
  const { data: botData, isLoading: isBotLoading } = useBot({ id: botId });
  const { data: workflow } = useWorkflowWithNodes({ id: botId });

  if (isBotLoading || !botData) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-full overflow-hidden p-0">
      <div className="space-y-2 p-8">
        <Suspense fallback={<LoadingSpinner />}>
          <SingleFieldFormWrapper
            botData={botData}
            fieldName="name"
            placeholder="AI agent"
          />
          <SingleFieldFormWrapper
            botData={botData}
            fieldName="token"
            placeholder="0123456789:ASkD8FzC8DFt8DXdS8-AcD8FAbSDF"
          />
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
