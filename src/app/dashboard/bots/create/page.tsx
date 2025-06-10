import { ThemeProvider } from 'next-themes';
import { redirect } from 'next/navigation';

import { AppSidebar } from '~/components/AppSidebar';
import BotPage from '~/components/BotPage/BotPage';
import { SiteHeader } from '~/components/SiteHeader';
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar';
import DnDContextProvider from '~/context/DnDContext';
import ReactFlowContextProvider from '~/context/ReactFlowContext';
import { auth } from '~/server/auth';
import { HydrateClient } from '~/trpc/server';

export default async function Page() {
  const session = await auth();
  if (!session?.user) {
    redirect('/');
  }

  return (
    <HydrateClient>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
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
            <ReactFlowContextProvider>
              <DnDContextProvider>
                <BotPage />
              </DnDContextProvider>
            </ReactFlowContextProvider>
          </SidebarInset>
        </SidebarProvider>
      </ThemeProvider>
    </HydrateClient>
  );
}
