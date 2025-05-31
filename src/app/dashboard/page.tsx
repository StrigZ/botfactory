import { ThemeProvider } from 'next-themes';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { AppSidebar } from '~/components/AppSidebar';
import BotTable from '~/components/BotTable/BotTable';
import LoadingSpinner from '~/components/LoadingSpinner';
import { SiteHeader } from '~/components/SiteHeader';
import Summary from '~/components/Summary';
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar';
import { auth } from '~/server/auth';
import { HydrateClient, api } from '~/trpc/server';

export default async function Page() {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  void api.bot.getAll.prefetch();

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
          <SidebarInset className="relative">
            <SiteHeader />
            <div className="container mx-auto max-w-4xl p-4">
              <Suspense fallback={<LoadingSpinner />}>
                <Summary />
              </Suspense>
              <Suspense fallback={<LoadingSpinner />}>
                <BotTable />
              </Suspense>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </ThemeProvider>
    </HydrateClient>
  );
}
