export type Module = 'dashboard' | 'clientes' | 'presupuestos' | 'configuracion' | 'admin';
export type Action = 'ver' | 'crear' | 'editar' | 'eliminar' | 'exportar';

export interface Permission {
  module: Module;
  action: Action;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
}

export interface UserWithRoles {
  id: string;
  email: string;
  username: string | null;
  display_name: string | null;
  roles: Role[];
}
