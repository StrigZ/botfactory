'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import type * as React from 'react';
import { Toaster } from 'sonner';

import { AuthProvider } from '~/context/AuthContext';
import { getQueryClient } from '~/lib/query-client';

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        {children} <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}
