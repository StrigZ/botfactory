import '@xyflow/react/dist/style.css';
import { type Metadata } from 'next';
import { Geist } from 'next/font/google';
import Script from 'next/script';

import Providers from '~/providers/providers';
import '~/styles/globals.css';

export const metadata: Metadata = {
  title: 'Bot Factory',
  description: 'No code bot constructor',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
