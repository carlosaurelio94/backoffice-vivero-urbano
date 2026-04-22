'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Leaf, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function RecuperarPage() {
  const [username, setUsername] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [sent,     setSent]     = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');

    // 1. Resolver username → email
    const { data: email, error: rpcErr } = await supabase
      .rpc('get_email_by_username', { p_username: username.trim().toLowerCase() });

    if (rpcErr || !email) {
      setError('No se encontró ese usuario.');
      setLoading(false);
      return;
    }

    // 2. Enviar email de recuperación
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(
      email as string,
      { redirectTo: `${window.location.origin}/auth/callback?next=/nueva-contrasena` }
    );

    if (resetErr) {
      setError('Error al enviar el email. Intentá de nuevo.');
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-sm">

        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 shadow-lg">
            <Leaf className="h-7 w-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Vivero Urbano</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">Recuperar acceso</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">📬</div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">Revisá tu email</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Te enviamos un link para cambiar tu contraseña. Revisá también la carpeta de spam.
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 text-sm text-green-600 hover:underline dark:text-green-400">
                <ArrowLeft className="h-4 w-4" /> Volver al login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-slate-100">¿Olvidaste tu contraseña?</h2>
              <p className="mb-6 text-sm text-gray-500 dark:text-slate-400">
                Ingresá tu nombre de usuario y te enviamos un link para cambiarla.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Usuario</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="tu_usuario"
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900
                               focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500
                               dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? 'Enviando...' : 'Enviar link de recuperación'}
                </button>

                <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200">
                  <ArrowLeft className="h-4 w-4" /> Volver al login
                </Link>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
