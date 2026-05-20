import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.');
}

// Browser client de @supabase/ssr: persiste la sesión en cookies, que es
// lo que el middleware (createServerClient) lee. Si usamos el cliente
// estándar de @supabase/supabase-js, la sesión queda solo en localStorage
// y el middleware no la detecta → loop infinito en /login.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
