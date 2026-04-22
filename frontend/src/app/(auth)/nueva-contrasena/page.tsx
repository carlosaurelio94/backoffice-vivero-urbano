'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function NuevaContrasenaPage() {
  const router = useRouter();
  const [newPass,  setNewPass]  = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [ready,    setReady]    = useState(false);

  // Supabase redirige acá con el token en el hash — necesitamos que la sesión esté activa
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 6)  { setError('Mínimo 6 caracteres.'); return; }
    if (newPass !== confirm)  { setError('Las contraseñas no coinciden.'); return; }
    setLoading(true); setError('');

    const { error: err } = await supabase.auth.updateUser({ password: newPass });
    if (err) { setError(err.message); setLoading(false); return; }

    // Cerrar sesión y redirigir al login
    await supabase.auth.signOut();
    router.push('/login');
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
            <p className="text-sm text-gray-500 dark:text-slate-400">Nueva contraseña</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          {!ready ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-slate-400">Verificando el link...</p>
            </div>
          ) : (
            <>
              <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-slate-100">Establecer nueva contraseña</h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Nueva contraseña</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      required minLength={6}
                      value={newPass}
                      onChange={e => setNewPass(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 pr-9 text-sm text-gray-900
                                 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500
                                 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Repetir contraseña</label>
                  <input
                    type="password"
                    required
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Repetí la contraseña"
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
                  {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
