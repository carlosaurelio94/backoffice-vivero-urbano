'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Leaf, Loader2, ArrowLeft, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const [companyName, setCompanyName] = useState('');
  const [companySlug, setCompanySlug] = useState('');
  const [username,    setUsername]    = useState('');
  const [password,    setPassword]    = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [done,        setDone]        = useState(false);

  // Auto-generar slug desde el nombre
  const handleCompanyName = (v: string) => {
    setCompanyName(v);
    if (!companySlug || companySlug === slugify(companyName)) {
      setCompanySlug(slugify(v));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);

    const res = await fetch('/api/auth/signup', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ companyName, companySlug, username, password, displayName }),
    });
    const json = await res.json() as { ok?: boolean; error?: string; email?: string };

    if (!res.ok || !json.ok || !json.email) {
      setError(json.error ?? 'No se pudo completar el registro.');
      setLoading(false);
      return;
    }

    // Auto-login con las credenciales recién creadas
    const { error: signErr } = await supabase.auth.signInWithPassword({
      email:    json.email,
      password,
    });
    if (signErr) {
      // Crear funcionó, pero el login automático no — mandar al login manual.
      setDone(true); setLoading(false);
      return;
    }

    window.location.href = '/dashboard';
  };

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-slate-950">
        <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">¡Empresa creada!</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
            Iniciá sesión para entrar a tu backoffice.
          </p>
          <Link href="/login" className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
            Ir al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 dark:bg-slate-950">
      <div className="w-full max-w-md">

        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 shadow-lg">
            <Leaf className="h-7 w-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Crear tu backoffice</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">Plan gratuito, sin tarjeta</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <Section title="Tu empresa">
              <Field label="Nombre" required value={companyName} onChange={handleCompanyName} placeholder="Mi Empresa S.A." />
              <Field label="Slug (URL interna)" required value={companySlug}
                     onChange={v => setCompanySlug(v.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                     hint="Solo minúsculas, números y guiones"
                     placeholder="mi-empresa" />
            </Section>

            <Section title="Tu usuario administrador">
              <Field label="Nombre visible" value={displayName} onChange={setDisplayName} placeholder="Tu nombre" />
              <Field label="Usuario" required value={username}
                     onChange={v => setUsername(v.toLowerCase().replace(/\s+/g, '_'))}
                     hint="Lo vas a usar para entrar"
                     placeholder="tu_usuario" />
              <Field label="Contraseña" type="password" required value={password} onChange={setPassword}
                     hint="Mínimo 8 caracteres" placeholder="••••••••" />
            </Section>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Creando...' : 'Crear mi backoffice'}
            </button>

            <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200">
              <ArrowLeft className="h-4 w-4" /> ¿Ya tenés cuenta? Iniciá sesión
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 32);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">{title}</h3>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Field({
  label, value, onChange, required, type = 'text', hint, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void;
  required?: boolean; type?: string; hint?: string; placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{label}{required && ' *'}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900
                   focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500
                   dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      />
      {hint && <span className="text-xs text-gray-400 dark:text-slate-500">{hint}</span>}
    </label>
  );
}
