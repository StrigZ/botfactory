import { ThemeProvider } from 'next-themes';
import { redirect } from 'next/navigation';

import { AppSidebar } from '~/components/AppSidebar';
import BotList from '~/components/BotList';
import { ChartAreaInteractive } from '~/components/ChartAreaInteractive';
import CreateBotButton from '~/components/CreateBotButton';
import { DataTable } from '~/components/DataTable';
import { SectionCards } from '~/components/SectionCards';
import { SiteHeader } from '~/components/SiteHeader';
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar';
import { auth } from '~/server/auth';
import { HydrateClient, api } from '~/trpc/server';

import data from './data.json';

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
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  {/* <SectionCards /> */}
                  <div className="px-4 lg:px-6">
                    {/* <ChartAreaInteractive /> */}
                  </div>
                  {/* <DataTable data={data} /> */}
                </div>
              </div>
            </div>
            <BotList />
          </SidebarInset>
        </SidebarProvider>
      </ThemeProvider>
    </HydrateClient>
  );
}
