import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';

import SidebarWrapper from '~/components/SidebarWrapper';
import { getQueryClient } from '~/lib/query-client';

type Props = { children: ReactNode };
export default function DashboardLayout({ children }: Props) {
  const queryClient = getQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SidebarWrapper>{children}</SidebarWrapper>
      </ThemeProvider>
    </HydrationBoundary>
  );
}
