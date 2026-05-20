-- ============================================================
-- Seed: crear primera empresa + usuario administrador
-- ============================================================
-- Cambiá los valores de las variables y ejecutalo en SQL Editor.
-- Si ya corriste esto antes, podés omitirlo.
-- ============================================================

INSERT INTO companies (slug, name, legal_name, primary_color, plan)
VALUES ('mi-empresa', 'Mi Empresa', 'Mi Empresa S.A.', '#16a34a', 'free')
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE
  v_user_id    UUID := gen_random_uuid();
  v_company_id UUID;
  v_role_id    UUID;

  -- ← EDITAR ESTOS VALORES ↓
  v_email      TEXT := 'admin@miempresa.com';
  v_password   TEXT := 'CambialaYa2026!';
  v_username   TEXT := 'admin';
  v_display    TEXT := 'Administrador';
  v_company_slug TEXT := 'mi-empresa';
  -- ← EDITAR ESTOS VALORES ↑
BEGIN
  -- Importante: GoTrue espera '' (no NULL) en los campos token/change.
  INSERT INTO auth.users (
    instance_id, id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, is_sso_user, is_anonymous,
    confirmation_token, recovery_token,
    email_change, email_change_token_new, email_change_token_current,
    phone_change, phone_change_token, reauthentication_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id, 'authenticated', 'authenticated', v_email,
    crypt(v_password, gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    NOW(), NOW(), FALSE, FALSE,
    '', '', '', '', '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', v_email, 'email_verified', true),
    'email', v_user_id::text,
    NOW(), NOW(), NOW()
  );

  UPDATE public.profiles
     SET username = v_username, display_name = v_display
   WHERE id = v_user_id;

  SELECT id INTO v_company_id FROM companies WHERE slug = v_company_slug;
  SELECT id INTO v_role_id    FROM roles     WHERE name = 'administrador';

  INSERT INTO public.user_companies (user_id, company_id, role_id)
  VALUES (v_user_id, v_company_id, v_role_id);

  UPDATE public.profiles
     SET current_company_id = v_company_id
   WHERE id = v_user_id;
END $$;
