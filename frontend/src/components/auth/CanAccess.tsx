'use client';

import type { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import type { Module, Action } from '@/types/permissions';

interface CanAccessProps {
  module: Module;
  action: Action;
  /** Si se pasa, se renderiza esto cuando no hay permiso en lugar de null */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Wrapper de permisos. Solo renderiza `children` si el usuario tiene el permiso solicitado.
 *
 * Uso:
 *   <CanAccess module="clientes" action="crear">
 *     <Button>Nuevo cliente</Button>
 *   </CanAccess>
 */
export function CanAccess({ module, action, fallback = null, children }: CanAccessProps) {
  const { hasPermission, loading } = usePermissions();

  if (loading) return null;
  if (!hasPermission(module, action)) return <>{fallback}</>;
  return <>{children}</>;
}
