'use client';

import { Suspense } from 'react';

import DnDContextProvider from '~/context/DnDContext';
import ReactFlowContextProvider from '~/context/ReactFlowContext';
import { withAuth } from '~/hooks/use-auth';
import { useBot } from '~/hooks/use-bots';
import { useWorkflowWithNodes } from '~/hooks/use-workflows';

import CreateOrUpdateForm from '../CreateOrUpdateForm';
import LoadingSpinner from '../LoadingSpinner';
import Workflow from './Workflow/Workflow';

type Props = { botId?: string };
function BotPage({ botId }: Props) {
  const { data: botData } = useBot({ id: botId! });
  const { data: workflow } = useWorkflowWithNodes({ id: botId! });

  return (
    <div className="flex h-full overflow-hidden p-0">
      <div className="min-w-xs p-8">
        <Suspense fallback={<LoadingSpinner />}>
          <CreateOrUpdateForm botData={botData} isEditableByDefault={!botId} />
        </Suspense>
      </div>

      <div className="relative flex-1">
        {!botId ? (
          <>
            <span className="absolute inset-0 z-10 flex items-center justify-center">
              Verify the token to unlock the workflow!
            </span>
            <div className="font-heavy pointer-events-none relative flex h-full cursor-default items-center justify-center border border-black text-xl blur-md backdrop-blur-md" />
          </>
        ) : (
          workflow && (
            <ReactFlowContextProvider workflow={workflow}>
              <DnDContextProvider>
                <Workflow isEnabled={!!botData} />
              </DnDContextProvider>
            </ReactFlowContextProvider>
          )
        )}
      </div>
    </div>
  );
}

export default withAuth(BotPage);
