import { ThemeProvider } from 'next-themes';
import { redirect } from 'next/navigation';

import { AppSidebar } from '~/components/AppSidebar';
import DashboardPage from '~/components/DashboardPage/DashboardPage';
import { SiteHeader } from '~/components/SiteHeader';
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
            <DashboardPage />
          </SidebarInset>
        </SidebarProvider>
      </ThemeProvider>
    </HydrateClient>
  );
}
