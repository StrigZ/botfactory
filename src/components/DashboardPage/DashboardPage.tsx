'use client';

import { AppSidebar } from '~/components/AppSidebar';
import DashboardMain from '~/components/DashboardPage/DashboardMain';
import { SiteHeader } from '~/components/SiteHeader';
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar';
import { withAuth } from '~/hooks/use-auth';

function DashboardPage() {
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
      <SidebarInset className="relative">
        <SiteHeader />
        <DashboardMain />
      </SidebarInset>
    </SidebarProvider>
  );
}

export default withAuth(DashboardPage);
