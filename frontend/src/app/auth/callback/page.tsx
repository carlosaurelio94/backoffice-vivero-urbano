'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

/**
 * Maneja dos flujos de Supabase Auth:
 * - PKCE   → llega con ?code=xxx  (server puede leerlo)
 * - Implicit → llega con #access_token=... en el hash (solo el cliente puede leerlo)
 */
function CallbackHandler() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const next = searchParams.get('next') ?? '/dashboard';
    const code = searchParams.get('code');

    if (code) {
      // ── PKCE flow ──────────────────────────────────────────────────
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        router.replace(error ? '/login?error=link_invalido' : next);
      });
      return;
    }

    // ── Implicit flow ──────────────────────────────────────────────────
    // Supabase JS detecta automáticamente el #access_token= en la URL al iniciar.
    // Escuchamos el evento y redirigimos en cuanto la sesión esté lista.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        subscription.unsubscribe();
        clearTimeout(fallback);
        router.replace(next);
      }
    });

    // Por si la sesión ya estaba lista antes de que montara el componente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        subscription.unsubscribe();
        clearTimeout(fallback);
        router.replace(next);
      }
    });

    // Timeout de seguridad: si en 4s no hay sesión, volver al login
    const fallback = setTimeout(() => {
      subscription.unsubscribe();
      router.replace('/login?error=link_invalido');
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallback);
    };
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <p className="text-sm text-gray-500 dark:text-slate-400">Verificando acceso...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
