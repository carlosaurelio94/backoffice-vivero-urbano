import { redirect } from 'next/navigation';

/**
 * La raíz redirige automáticamente al dashboard.
 * Next.js App Router ejecuta esto en el servidor (Server Component).
 */
export default function RootPage() {
  redirect('/dashboard');
}
