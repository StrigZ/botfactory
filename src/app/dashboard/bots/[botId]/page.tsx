import { ThemeProvider } from 'next-themes';
import { redirect } from 'next/navigation';

import { AppSidebar } from '~/components/AppSidebar';
import BotList from '~/components/BotList';
import BotPage from '~/components/BotPage';
import CreateOrUpdateForm from '~/components/CreateOrUpdateForm';
import { SiteHeader } from '~/components/SiteHeader';
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar';
import { auth } from '~/server/auth';
import { HydrateClient, api } from '~/trpc/server';

export default async function Page({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  void api.bot.getById.prefetch(
    { id: botId, withComponents: true },
    { queryHash: 'botToUpdate' },
  );

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
            <BotPage botId={botId} />
          </SidebarInset>
        </SidebarProvider>
      </ThemeProvider>
    </HydrateClient>
  );
}
