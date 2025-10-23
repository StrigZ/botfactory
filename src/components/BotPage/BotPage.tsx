'use client';

import { AppSidebar } from '~/components/AppSidebar';
import { SiteHeader } from '~/components/SiteHeader';
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar';
import DnDContextProvider from '~/context/DnDContext';
import ReactFlowContextProvider from '~/context/ReactFlowContext';
import { withAuth } from '~/hooks/use-auth';

import BotPageContent from './BotPageContent';

type Props = { botId?: string };
function BotPage({ botId }: Props) {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <ReactFlowContextProvider botId={botId}>
          <DnDContextProvider>
            <BotPageContent botId={botId} />
          </DnDContextProvider>
        </ReactFlowContextProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default withAuth(BotPage);
