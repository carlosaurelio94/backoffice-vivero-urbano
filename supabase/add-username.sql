-- ============================================================
-- Agregar soporte de username a profiles
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Agregar columna username
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- 2. Asignar username al usuario existente (carlosaureliordriguez23@gmail.com)
--    Podés cambiar 'carlos' por el nombre de usuario que quieras usar para loguearte
UPDATE profiles
SET username = 'carlos'
WHERE email = 'carlosaureliordriguez23@gmail.com'
  AND username IS NULL;

-- 3. Función RPC para resolver username → email (accesible sin autenticar)
CREATE OR REPLACE FUNCTION get_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM profiles WHERE username = lower(p_username) LIMIT 1;
$$;

-- Permitir que usuarios no autenticados llamen a esta función
GRANT EXECUTE ON FUNCTION get_email_by_username TO anon;

-- 4. Index para búsquedas rápidas por username
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
