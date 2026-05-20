'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export interface Plan {
  id:                     string;
  slug:                   string;
  name:                   string;
  description:            string | null;
  price_monthly_ars:      number;
  price_monthly_usd:      number;
  max_users:              number | null;
  max_clients:            number | null;
  max_quotes_per_month:   number | null;
  max_invoices_per_month: number | null;
  features:               Record<string, boolean | string | number>;
  sort_order:             number;
}

export interface Company {
  id:             string;
  slug:           string;
  name:           string;
  legal_name:     string | null;
  tax_id:         string | null;
  logo_url:       string | null;
  primary_color:  string | null;
  plan:           string;
  plan_id:        string | null;
  active:         boolean;
}

interface CompanyContextValue {
  current:       Company | null;
  currentPlan:   Plan | null;
  available:     Company[];
  isSuperAdmin:  boolean;
  switchTo:      (companyId: string) => Promise<void>;
  refresh:       () => Promise<void>;
  loading:       boolean;
}

const CompanyContext = createContext<CompanyContextValue>({
  current:      null,
  currentPlan:  null,
  available:    [],
  isSuperAdmin: false,
  switchTo:     async () => {},
  refresh:      async () => {},
  loading:      true,
});

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [current,      setCurrent]      = useState<Company | null>(null);
  const [currentPlan,  setCurrentPlan]  = useState<Plan | null>(null);
  const [available,    setAvailable]    = useState<Company[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading,      setLoading]      = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setCurrent(null); setCurrentPlan(null); setAvailable([]);
      setIsSuperAdmin(false); setLoading(false); return;
    }

    const { data: memberships } = await supabase
      .from('user_companies')
      .select('company:companies(*)')
      .eq('user_id', user.id);

    type Row = { company: Company };
    const companies = (memberships as unknown as Row[] ?? [])
      .map((m) => m.company)
      .filter(Boolean);

    setAvailable(companies);

    const { data: profile } = await supabase
      .from('profiles')
      .select('current_company_id, is_super_admin')
      .eq('id', user.id)
      .single();

    setIsSuperAdmin(profile?.is_super_admin === true);

    const activeId = profile?.current_company_id ?? companies[0]?.id ?? null;
    const active = companies.find((c) => c.id === activeId) ?? null;
    setCurrent(active);

    if (active?.plan_id) {
      const { data: plan } = await supabase
        .from('plans')
        .select('*')
        .eq('id', active.plan_id)
        .maybeSingle();
      setCurrentPlan((plan as Plan | null) ?? null);
    } else {
      setCurrentPlan(null);
    }

    setLoading(false);
  }, []);

  const switchTo = useCallback(async (companyId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update({ current_company_id: companyId }).eq('id', user.id);
    await load();
  }, [load]);

  useEffect(() => {
    void load(); // eslint-disable-line react-hooks/set-state-in-effect
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { void load(); });
    return () => subscription.unsubscribe();
  }, [load]);

  return (
    <CompanyContext.Provider value={{
      current, currentPlan, available, isSuperAdmin,
      switchTo, refresh: load, loading,
    }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  return useContext(CompanyContext);
}

export function useSuperAdmin() {
  return useContext(CompanyContext).isSuperAdmin;
}
