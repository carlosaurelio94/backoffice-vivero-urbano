'use client';

import { useEffect, useState, useCallback } from 'react';
import { Building2, Loader2, X, ShieldCheck, Users, Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSuperAdmin } from '@/context/CompanyContext';

interface CompanyRow {
  id:            string;
  slug:          string;
  name:          string;
  legal_name:    string | null;
  primary_color: string | null;
  plan:          string;
  plan_id:       string | null;
  active:        boolean;
  created_at:    string;
  user_count?:   number;
}

interface PlanRow {
  id:   string;
  slug: string;
  name: string;
}

export default function AdminCompaniesPage() {
  const isSuperAdmin = useSuperAdmin();
  const [rows,    setRows]    = useState<CompanyRow[]>([]);
  const [plans,   setPlans]   = useState<PlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CompanyRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [comps, pls, counts] = await Promise.all([
      supabase.from('companies').select('*').order('created_at', { ascending: false }),
      supabase.from('plans').select('id, slug, name').order('sort_order'),
      supabase.from('user_companies').select('company_id'),
    ]);

    const countMap = new Map<string, number>();
    ((counts.data as { company_id: string }[] | null) ?? []).forEach((r) => {
      countMap.set(r.company_id, (countMap.get(r.company_id) ?? 0) + 1);
    });

    setRows(((comps.data as CompanyRow[] | null) ?? []).map((c) => ({
      ...c,
      user_count: countMap.get(c.id) ?? 0,
    })));
    setPlans((pls.data as PlanRow[] | null) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]); // eslint-disable-line react-hooks/set-state-in-effect

  if (!isSuperAdmin) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-gray-400">
        <ShieldCheck className="h-10 w-10" />
        <p className="text-sm">Sólo super-administradores.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center gap-3">
        <Building2 className="h-7 w-7 text-green-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Empresas (cross-tenant)</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Gestión global de todas las empresas del SaaS</p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800">
              <tr>
                <Th>Empresa</Th>
                <Th>Slug</Th>
                <Th>Plan</Th>
                <Th>Usuarios</Th>
                <Th>Estado</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {rows.map((c) => (
                <tr key={c.id}>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: c.primary_color ?? '#16a34a' }} />
                      <span className="font-medium text-gray-900 dark:text-slate-100">{c.name}</span>
                    </div>
                  </Td>
                  <Td><code className="text-xs text-gray-500 dark:text-slate-400">{c.slug}</code></Td>
                  <Td>
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                      {c.plan}
                    </span>
                  </Td>
                  <Td>
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                      <Users className="h-3 w-3" /> {c.user_count}
                    </span>
                  </Td>
                  <Td>
                    {c.active
                      ? <span className="text-xs text-green-600 dark:text-green-400">activa</span>
                      : <span className="text-xs text-gray-400">pausada</span>}
                  </Td>
                  <Td>
                    <button
                      onClick={() => setEditing(c)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </Td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><Td colSpan={6}><p className="py-8 text-center text-sm text-gray-400">No hay empresas todavía.</p></Td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <EditCompanyModal
          company={editing}
          plans={plans}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); void load(); }}
        />
      )}
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">{children}</th>;
}
function Td({ children, colSpan }: { children?: React.ReactNode; colSpan?: number }) {
  return <td colSpan={colSpan} className="px-4 py-3">{children}</td>;
}

function EditCompanyModal({
  company, plans, onClose, onSaved,
}: {
  company: CompanyRow; plans: PlanRow[]; onClose: () => void; onSaved: () => void;
}) {
  const [name,         setName]         = useState(company.name);
  const [planId,       setPlanId]       = useState(company.plan_id ?? '');
  const [active,       setActive]       = useState(company.active);
  const [primaryColor, setPrimaryColor] = useState(company.primary_color ?? '#16a34a');
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState('');

  const handleSave = async () => {
    setSaving(true); setError('');
    const planSlug = plans.find((p) => p.id === planId)?.slug ?? company.plan;
    const { error: e } = await supabase.from('companies').update({
      name,
      plan_id:       planId || null,
      plan:          planSlug,
      active,
      primary_color: primaryColor,
    }).eq('id', company.id);
    if (e) { setError(e.message); setSaving(false); return; }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-slate-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">Editar empresa</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-600 dark:text-slate-400">Nombre</span>
            <input value={name} onChange={(e) => setName(e.target.value)}
                   className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-600 dark:text-slate-400">Plan</span>
            <select value={planId} onChange={(e) => setPlanId(e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
              <option value="">Sin plan</option>
              {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-600 dark:text-slate-400">Color de marca</span>
            <div className="flex items-center gap-2">
              <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-9 w-12 cursor-pointer rounded border border-gray-300 dark:border-slate-600" />
              <input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                     className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
            </div>
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            <span className="text-sm text-gray-700 dark:text-slate-300">Activa</span>
          </label>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

