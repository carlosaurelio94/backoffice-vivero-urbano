'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Resolver username → email via RPC (accesible sin autenticar)
      const { data: emailData, error: rpcError } = await supabase
        .rpc('get_email_by_username', { p_username: username.trim().toLowerCase() });

      if (rpcError || !emailData) {
        setError('Usuario o contraseña incorrectos.');
        setLoading(false);
        return;
      }

      // 2. Autenticar con el email resuelto
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: emailData as string,
        password,
      });

      if (authError) {
        setError('Usuario o contraseña incorrectos.');
        setLoading(false);
        return;
      }

      // 3. Hard redirect para que el middleware vea la cookie de sesión
      window.location.href = '/dashboard';

    } catch {
      setError('Ocurrió un error inesperado. Intentá de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 shadow-lg">
            <Leaf className="h-7 w-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Vivero Urbano</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">Backoffice · Acceso privado</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-slate-100">Iniciar sesión</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Usuario</label>
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900
                           focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500
                           dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                placeholder="tu_usuario"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Contraseña</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900
                           focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500
                           dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} className="mt-2 w-full justify-center">
              Entrar
            </Button>

            <div className="text-center">
              <Link href="/recuperar" className="text-sm text-gray-500 hover:text-green-600 dark:text-slate-400 dark:hover:text-green-400 transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
