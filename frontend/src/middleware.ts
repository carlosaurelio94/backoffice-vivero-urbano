import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isLanding          = path === '/';
  const isLoginPage        = path.startsWith('/login');
  const isRecoverPage      = path.startsWith('/recuperar');
  const isNewPasswordPage  = path.startsWith('/nueva-contrasena');
  const isRegisterPage     = path.startsWith('/register');
  const isAuthCallback     = path.startsWith('/auth/callback');
  const isSignupApi        = path.startsWith('/api/auth/signup');
  const isPublic           = isLanding || isLoginPage || isRecoverPage || isNewPasswordPage || isRegisterPage || isAuthCallback || isSignupApi;

  // No autenticado → mandar a la landing, no al login. Alguien que cae acá sin
  // sesión puede ser un visitante que no sabe qué es esto; el formulario pelado
  // no le dice nada. La landing explica y tiene el botón de ingreso.
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Ya autenticado intentando ir a /login → redirigir al dashboard
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
