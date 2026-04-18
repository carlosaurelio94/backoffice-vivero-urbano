'use client';

import { useEffect, useState, useCallback } from 'react';
import { ShieldCheck, Plus, X, Loader2, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePermissions } from '@/hooks/usePermissions';
import type { Role, UserWithRoles } from '@/types/permissions';

// ─── tipos crudos de Supabase ──────────────────────────────
interface ProfileRow {
  id:           string;
  email:        string;
  display_name: string | null;
  user_roles: {
    role: {
      id:          string;
      name:        string;
      description: string | null;
    };
  }[];
}

const ROLE_COLORS: Record<string, string> = {
  administrador:        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  usuario_clientes:     'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  usuario_presupuestos: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  viewer:               'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300',
};

export default function AdminPage() {
  const { isAdmin, loading: permLoading } = usePermissions();
  const [users,   setUsers]   = useState<UserWithRoles[]>([]);
  const [roles,   setRoles]   = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding,  setAdding]  = useState<string | null>(null); // userId con dropdown abierto
  const [saving,  setSaving]  = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [profilesRes, rolesRes] = await Promise.all([
      supabase.from('profiles').select(`
        id, email, display_name,
        user_roles ( role:roles ( id, name, description ) )
      `),
      supabase.from('roles').select('id, name, description').order('name'),
    ]);

    if (profilesRes.data) {
      const rows = profilesRes.data as unknown as ProfileRow[];
      setUsers(
        rows.map((p) => ({
          id:           p.id,
          email:        p.email,
          display_name: p.display_name,
          roles: p.user_roles.map((ur) => ({
            id:          ur.role.id,
            name:        ur.role.name,
            description: ur.role.description,
          })),
        }))
      );
    }
    if (rolesRes.data) setRoles(rolesRes.data as Role[]);
    setLoading(false);
  }, []);

  useEffect(() => { void fetchData(); }, [fetchData]);

  const addRole = async (userId: string, roleId: string) => {
    setSaving(true);
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role_id: roleId });
    if (!error) { setAdding(null); await fetchData(); }
    setSaving(false);
  };

  const removeRole = async (userId: string, roleId: string) => {
    setSaving(true);
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleId);
    if (!error) await fetchData();
    setSaving(false);
  };

  // Roles que el usuario todavía no tiene (para el dropdown de añadir)
  const availableRoles = (user: UserWithRoles) =>
    roles.filter((r) => !user.roles.some((ur) => ur.id === r.id));

  if (permLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-gray-400">
        <ShieldCheck className="h-10 w-10" />
        <p className="text-sm">No tenés permisos para acceder a esta sección.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-7 w-7 text-green-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Administración</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Gestión de usuarios y roles</p>
        </div>
      </div>

      {/* Referencia de roles */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-slate-300">Roles disponibles</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-slate-700 dark:bg-slate-800"
            >
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[role.name] ?? 'bg-gray-100 text-gray-600'}`}>
                {role.name}
              </span>
              {role.description && (
                <p className="mt-1.5 text-xs text-gray-500 dark:text-slate-400">{role.description}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Tabla de usuarios */}
      <section className="rounded-xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            Usuarios ({users.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-slate-800">
          {users.map((user) => (
            <div key={user.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:gap-6">

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-slate-100">
                  {user.display_name ?? user.email}
                </p>
                {user.display_name && (
                  <p className="truncate text-xs text-gray-500 dark:text-slate-400">{user.email}</p>
                )}
              </div>

              {/* Roles actuales */}
              <div className="flex flex-wrap items-center gap-2">
                {user.roles.length === 0 && (
                  <span className="text-xs text-gray-400 dark:text-slate-500">Sin roles</span>
                )}
                {user.roles.map((role) => (
                  <span
                    key={role.id}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[role.name] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {role.name}
                    <button
                      onClick={() => removeRole(user.id, role.id)}
                      disabled={saving}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 disabled:opacity-50"
                      title="Quitar rol"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Agregar rol */}
              <div className="relative shrink-0">
                {availableRoles(user).length > 0 && (
                  <>
                    <button
                      onClick={() => setAdding(adding === user.id ? null : user.id)}
                      className="flex items-center gap-1 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs text-gray-500
                                 hover:border-green-400 hover:text-green-600 transition-colors
                                 dark:border-slate-600 dark:text-slate-400 dark:hover:border-green-500 dark:hover:text-green-400"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Agregar rol
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>

                    {adding === user.id && (
                      <div className="absolute right-0 top-full z-10 mt-1 w-52 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                        {availableRoles(user).map((role) => (
                          <button
                            key={role.id}
                            onClick={() => addRole(user.id, role.id)}
                            disabled={saving}
                            className="flex w-full flex-col px-4 py-2.5 text-left text-sm hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-slate-800 first:rounded-t-xl last:rounded-b-xl"
                          >
                            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[role.name] ?? 'bg-gray-100'}`}>
                              {role.name}
                            </span>
                            {role.description && (
                              <span className="mt-0.5 text-xs text-gray-400 dark:text-slate-500">
                                {role.description}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
