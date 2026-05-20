'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export interface Company {
  id:             string;
  slug:           string;
  name:           string;
  legal_name:     string | null;
  tax_id:         string | null;
  logo_url:       string | null;
  primary_color:  string | null;
  plan:           string;
  active:         boolean;
}

interface CompanyContextValue {
  current:    Company | null;          // empresa activa
  available:  Company[];               // todas las empresas a las que pertenece el user
  switchTo:   (companyId: string) => Promise<void>;
  refresh:    () => Promise<void>;
  loading:    boolean;
}

const CompanyContext = createContext<CompanyContextValue>({
  current:   null,
  available: [],
  switchTo:  async () => {},
  refresh:   async () => {},
  loading:   true,
});

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [current,   setCurrent]   = useState<Company | null>(null);
  const [available, setAvailable] = useState<Company[]>([]);
  const [loading,   setLoading]   = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setCurrent(null); setAvailable([]); setLoading(false); return; }

    // Empresas a las que pertenece
    const { data: memberships } = await supabase
      .from('user_companies')
      .select('company:companies(*)')
      .eq('user_id', user.id);

    type Row = { company: Company };
    const companies = (memberships as unknown as Row[] ?? [])
      .map((m) => m.company)
      .filter(Boolean);

    setAvailable(companies);

    // Empresa activa (current_company_id del profile)
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_company_id')
      .eq('id', user.id)
      .single();

    const activeId = profile?.current_company_id ?? companies[0]?.id ?? null;
    setCurrent(companies.find((c) => c.id === activeId) ?? null);
    setLoading(false);
  }, []);

  const switchTo = useCallback(async (companyId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update({ current_company_id: companyId }).eq('id', user.id);
    await load();
  }, [load]);

  useEffect(() => {
    void load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { void load(); });
    return () => subscription.unsubscribe();
  }, [load]);

  return (
    <CompanyContext.Provider value={{ current, available, switchTo, refresh: load, loading }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  return useContext(CompanyContext);
}
