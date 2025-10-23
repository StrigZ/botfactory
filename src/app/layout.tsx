import '@xyflow/react/dist/style.css';
import { type Metadata } from 'next';
import { Geist } from 'next/font/google';

import { Toaster } from '~/components/ui/sonner';
import { AuthProvider } from '~/context/AuthContext';
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
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body>
        <TRPCReactProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
