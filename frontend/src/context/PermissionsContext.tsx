'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useCompany } from '@/context/CompanyContext';
import type { Module, Action, Permission, Role } from '@/types/permissions';

interface PermissionsContextValue {
  permissions: Permission[];
  roles: Role[];
  hasPermission: (module: Module, action: Action) => boolean;
  canView: (module: Module) => boolean;
  isAdmin: boolean;
  loading: boolean;
}

const PermissionsContext = createContext<PermissionsContextValue>({
  permissions: [],
  roles: [],
  hasPermission: () => false,
  canView: () => false,
  isAdmin: false,
  loading: true,
});

interface RolePermissionRow {
  role: {
    id: string;
    name: string;
    description: string | null;
    role_permissions: {
      permission: {
        module: string;
        action: string;
      };
    }[];
  };
}

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles]             = useState<Role[]>([]);
  const [loading, setLoading]         = useState(true);
  const { current: company }          = useCompany();

  const load = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        role:roles (
          id, name, description,
          role_permissions (
            permission:permissions ( module, action )
          )
        )
      `)
      .eq('user_id', user.id);

    if (error || !data) { setLoading(false); return; }

    const rows = data as unknown as RolePermissionRow[];

    const userRoles: Role[] = rows.map((r) => ({
      id:          r.role.id,
      name:        r.role.name,
      description: r.role.description,
    }));

    // Unión de todos los permisos de todos los roles (aditivo, sin conflictos)
    const permSet = new Set<string>();
    const userPerms: Permission[] = [];

    rows.forEach((r) => {
      r.role.role_permissions.forEach(({ permission }) => {
        const key = `${permission.module}:${permission.action}`;
        if (!permSet.has(key)) {
          permSet.add(key);
          userPerms.push({
            module: permission.module as Module,
            action: permission.action as Action,
          });
        }
      });
    });

    setRoles(userRoles);
    setPermissions(userPerms);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load(); // eslint-disable-line react-hooks/set-state-in-effect

    // Recargar permisos si cambia la sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      void load();
    });
    return () => subscription.unsubscribe();
  }, [load, company?.id]);  // ← recarga al cambiar de empresa

  const hasPermission = useCallback(
    (module: Module, action: Action) =>
      permissions.some((p) => p.module === module && p.action === action),
    [permissions]
  );

  const canView = useCallback(
    (module: Module) => hasPermission(module, 'ver'),
    [hasPermission]
  );

  const isAdmin = roles.some((r) => r.name === 'administrador');

  return (
    <PermissionsContext.Provider value={{ permissions, roles, hasPermission, canView, isAdmin, loading }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissionsContext() {
  return useContext(PermissionsContext);
}
