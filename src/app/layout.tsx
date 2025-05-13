import { type Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { Geist } from 'next/font/google';

import { Toaster } from '~/components/ui/sonner';
import '~/styles/globals.css';
import { TRPCReactProvider } from '~/trpc/react';

export const metadata: Metadata = {
  title: 'Bot Factory',
  description: 'No code bot constructor',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <TRPCReactProvider>
          <SessionProvider>
            {children}
            <Toaster />
          </SessionProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
