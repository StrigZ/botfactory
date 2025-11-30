import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';

import SidebarWrapper from '~/components/SidebarWrapper';

type Props = { children: ReactNode };
export default function DashboardLayout({ children }: Props) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarWrapper>{children}</SidebarWrapper>
    </ThemeProvider>
  );
}
