-- ============================================================
-- Row Level Security — Vivero Urbano Backoffice
-- Ejecutar DESPUÉS de crear el usuario en Supabase Auth
-- ============================================================
-- Solo usuarios autenticados pueden acceder a los datos.
-- El frontend usa la sesión de Supabase Auth automáticamente.
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE clients           ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_information ENABLE ROW LEVEL SECURITY;

-- ── Políticas: solo usuarios autenticados ─────────────────────

-- clients
CREATE POLICY "auth_all_clients" ON clients
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- quotes
CREATE POLICY "auth_all_quotes" ON quotes
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- quote_items
CREATE POLICY "auth_all_quote_items" ON quote_items
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- quote_information
CREATE POLICY "auth_all_quote_information" ON quote_information
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Para crear el usuario del backoffice, usá el dashboard de
-- Supabase: Authentication → Users → Add user
-- ============================================================
