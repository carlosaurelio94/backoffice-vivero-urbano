import { usePermissionsContext } from '@/context/PermissionsContext';

/**
 * Hook para consumir el contexto de permisos.
 *
 * Uso:
 *   const { hasPermission, canView, isAdmin } = usePermissions();
 *   if (!hasPermission('clientes', 'crear')) return null;
 */
export function usePermissions() {
  return usePermissionsContext();
}
