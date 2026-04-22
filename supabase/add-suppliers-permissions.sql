-- ============================================================
-- Agregar permisos para módulos proveedores y facturas
-- Ejecutar en Supabase SQL Editor (después de permissions.sql)
-- ============================================================

INSERT INTO permissions (module, action) VALUES
  ('proveedores', 'ver'),
  ('proveedores', 'crear'),
  ('proveedores', 'editar'),
  ('proveedores', 'eliminar'),
  ('facturas',    'ver'),
  ('facturas',    'crear'),
  ('facturas',    'editar'),
  ('facturas',    'aprobar'),
  ('facturas',    'pagar')
ON CONFLICT (module, action) DO NOTHING;

-- Administrador: todos los permisos nuevos
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'administrador'
  AND p.module IN ('proveedores', 'facturas')
ON CONFLICT DO NOTHING;

-- viewer: solo ver proveedores y facturas
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'viewer'
  AND p.module IN ('proveedores', 'facturas')
  AND p.action = 'ver'
ON CONFLICT DO NOTHING;
