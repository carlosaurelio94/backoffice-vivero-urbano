import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Cliente admin (server-only, nunca expuesto al browser)
function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase admin credentials');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// Verifica que el request venga de un usuario autenticado con rol administrador
async function requireAdmin(): Promise<{ ok: boolean; status?: number; message?: string }> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, status: 401, message: 'No autenticado' };

  const { data } = await supabase
    .from('user_roles')
    .select('role:roles(name)')
    .eq('user_id', user.id);

  type RoleRow = { role: { name: string } };
  const isAdmin = (data as unknown as RoleRow[] ?? [])
    .some((r) => r.role.name === 'administrador');

  if (!isAdmin) return { ok: false, status: 403, message: 'Sin permisos' };
  return { ok: true };
}

// POST /api/admin/users — crear usuario
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const body = await request.json() as { username: string; password: string; roleId: string; displayName?: string };
  const { username, password, roleId, displayName } = body;

  if (!username || !password || !roleId) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
  }

  const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '_');
  // Email interno — nunca se usa para login, solo para Supabase Auth
  const email = `${cleanUsername}@viverourbano.internal`;

  const admin = adminClient();

  // 1. Crear el usuario en Supabase Auth
  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // confirmado automáticamente, sin necesidad de email
  });

  if (createError || !newUser.user) {
    const msg = createError?.message ?? 'Error al crear usuario';
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const userId = newUser.user.id;

  // 2. Insertar perfil con username
  const { error: profileError } = await admin.from('profiles').upsert({
    id:           userId,
    email,
    username:     cleanUsername,
    display_name: displayName ?? cleanUsername,
  });

  if (profileError) {
    // Rollback: eliminar el usuario auth recién creado
    await admin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: 'Error al crear perfil' }, { status: 500 });
  }

  // 3. Asignar rol
  const { error: roleError } = await admin.from('user_roles').insert({
    user_id: userId,
    role_id:  roleId,
  });

  if (roleError) {
    return NextResponse.json({ error: 'Usuario creado pero no se pudo asignar el rol' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, userId, username: cleanUsername });
}

// DELETE /api/admin/users?userId=xxx — eliminar usuario
export async function DELETE(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Falta userId' }, { status: 400 });

  const admin = adminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
