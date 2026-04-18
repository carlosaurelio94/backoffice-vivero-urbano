-- ============================================================
-- SISTEMA DE ROLES Y PERMISOS - Vivero Urbano Backoffice
-- ============================================================
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Tabla de perfiles (espejo de auth.users para poder listarlos)
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  display_name TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: crear perfil automáticamente al crear usuario en auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Sincronizar usuario ya existente
INSERT INTO profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ============================================================

-- Módulos disponibles: dashboard, clientes, presupuestos, configuracion, admin
-- Acciones: ver, crear, editar, eliminar, exportar

CREATE TABLE IF NOT EXISTS permissions (
  id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  UNIQUE(module, action)
);

INSERT INTO permissions (module, action) VALUES
  ('dashboard',      'ver'),
  ('clientes',       'ver'),
  ('clientes',       'crear'),
  ('clientes',       'editar'),
  ('clientes',       'eliminar'),
  ('presupuestos',   'ver'),
  ('presupuestos',   'crear'),
  ('presupuestos',   'editar'),
  ('presupuestos',   'eliminar'),
  ('presupuestos',   'exportar'),
  ('configuracion',  'ver'),
  ('configuracion',  'editar'),
  ('admin',          'ver')
ON CONFLICT (module, action) DO NOTHING;

-- ============================================================

CREATE TABLE IF NOT EXISTS roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO roles (name, description) VALUES
  ('administrador',        'Acceso total a todos los módulos'),
  ('usuario_clientes',     'Solo módulo de clientes'),
  ('usuario_presupuestos', 'Solo módulo de presupuestos'),
  ('viewer',               'Lectura en todos los módulos')
ON CONFLICT (name) DO NOTHING;

-- ============================================================

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- administrador → todos los permisos
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'administrador'
ON CONFLICT DO NOTHING;

-- usuario_clientes → dashboard.ver + clientes.*
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'usuario_clientes'
  AND (
    (p.module = 'dashboard'  AND p.action = 'ver') OR
    (p.module = 'clientes')
  )
ON CONFLICT DO NOTHING;

-- usuario_presupuestos → dashboard.ver + presupuestos.*
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'usuario_presupuestos'
  AND (
    (p.module = 'dashboard'    AND p.action = 'ver') OR
    (p.module = 'presupuestos')
  )
ON CONFLICT DO NOTHING;

-- viewer → solo 'ver' en todos los módulos excepto admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'viewer'
  AND p.action = 'ver'
  AND p.module <> 'admin'
ON CONFLICT DO NOTHING;

-- ============================================================

CREATE TABLE IF NOT EXISTS user_roles (
  user_id     UUID NOT NULL,
  role_id     UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- Asignar rol administrador al primer usuario existente
INSERT INTO user_roles (user_id, role_id)
SELECT p.id, r.id
FROM profiles p, roles r
WHERE r.name = 'administrador'
ON CONFLICT DO NOTHING;

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles        ENABLE ROW LEVEL SECURITY;

-- Perfiles: cada usuario ve todos (necesario para el admin)
CREATE POLICY "auth_select_profiles" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "auth_insert_profiles" ON profiles
  FOR INSERT TO authenticated WITH CHECK (true);

-- Permissions y roles: solo lectura para autenticados
CREATE POLICY "auth_select_permissions" ON permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "auth_select_roles" ON roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "auth_select_role_permissions" ON role_permissions
  FOR SELECT TO authenticated USING (true);

-- user_roles: cualquier auth puede leer (para cargar permisos propios)
--             solo admins pueden escribir (verificado en la app)
CREATE POLICY "auth_select_user_roles" ON user_roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "auth_insert_user_roles" ON user_roles
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "auth_delete_user_roles" ON user_roles
  FOR DELETE TO authenticated USING (true);
