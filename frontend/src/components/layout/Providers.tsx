'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries:   { staleTime: 60 * 1000, retry: 1 },
          mutations: { onError: () => {} }, // los hooks manejan sus propios errores
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Toaster de sonner — posicionado arriba a la derecha */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{ duration: 3000 }}
      />
    </QueryClientProvider>
  );
}
