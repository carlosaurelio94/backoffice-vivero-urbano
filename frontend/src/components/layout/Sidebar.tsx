'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { usePermissions } from '@/hooks/usePermissions';
import { useCompany } from '@/context/CompanyContext';
import { supabase } from '@/lib/supabase';
import type { Module } from '@/types/permissions';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  ShieldCheck,
  Leaf,
  Sun,
  Moon,
  LogOut,
  Building2,
  Receipt,
  ChevronsUpDown,
  Check,
  CreditCard,
  Globe,
} from 'lucide-react';

interface NavItem {
  href:    string;
  label:   string;
  icon:    React.ElementType;
  module:  Module;
}

const navItems: NavItem[] = [
  { href: '/dashboard',        label: 'Dashboard',       icon: LayoutDashboard, module: 'dashboard'     },
  { href: '/clients',          label: 'Clientes',         icon: Users,           module: 'clientes'      },
  { href: '/quotes',           label: 'Presupuestos',     icon: FileText,        module: 'presupuestos'  },
  { href: '/suppliers',        label: 'Proveedores',      icon: Building2,       module: 'proveedores'   },
  { href: '/invoices',         label: 'Facturas',         icon: Receipt,         module: 'facturas'      },
  { href: '/settings',         label: 'Configuración',    icon: Settings,        module: 'configuracion' },
  { href: '/settings/billing', label: 'Plan y facturación', icon: CreditCard,    module: 'configuracion' },
  { href: '/admin',            label: 'Usuarios y roles', icon: ShieldCheck,     module: 'admin'         },
];

export function Sidebar() {
  const pathname    = usePathname();
  const router      = useRouter();
  const { isDark, toggle } = useTheme();
  const { canView, loading } = usePermissions();
  const { current: company, available, switchTo, isSuperAdmin } = useCompany();
  const [companyMenuOpen, setCompanyMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleSwitch = async (companyId: string) => {
    setCompanyMenuOpen(false);
    if (companyId === company?.id) return;
    await switchTo(companyId);
    router.refresh();
  };

  const brandColor = company?.primary_color ?? '#16a34a';
  const brandName  = company?.name ?? 'Backoffice';

  const visibleItems = loading
    ? []
    : navItems.filter((item) => canView(item.module));

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">

      {/* Header con switcher de empresa */}
      <div className="relative border-b border-gray-200 dark:border-slate-700">
        <button
          onClick={() => available.length > 1 && setCompanyMenuOpen(!companyMenuOpen)}
          className={cn(
            'flex h-16 w-full items-center gap-3 px-6 text-left',
            available.length > 1 && 'hover:bg-gray-50 dark:hover:bg-slate-800'
          )}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: brandColor }}
          >
            {company?.logo_url
              ? <img src={company.logo_url} alt="" className="h-5 w-5 object-contain" />
              : <Leaf className="h-5 w-5 text-white" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-gray-900 dark:text-slate-100">{brandName}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Backoffice</p>
          </div>
          {available.length > 1 && (
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-gray-400" />
          )}
        </button>

        {companyMenuOpen && available.length > 1 && (
          <div className="absolute left-3 right-3 top-full z-20 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
            {available.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSwitch(c.id)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                <div className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: c.primary_color ?? '#16a34a' }} />
                <span className="flex-1 truncate text-gray-700 dark:text-slate-200">{c.name}</span>
                {c.id === company?.id && <Check className="h-3.5 w-3.5 text-green-600" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {loading && (
          <div className="flex flex-col gap-2 px-3 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 animate-pulse rounded-lg bg-gray-100 dark:bg-slate-800" />
            ))}
          </div>
        )}
        {visibleItems.map(({ href, label, icon: Icon }) => {
          // Match exacto para /settings, prefix para los demás
          const active = href === '/settings'
            ? pathname === '/settings'
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
              )}
            >
              <Icon className={cn('h-5 w-5', active ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-slate-500')} />
              {label}
            </Link>
          );
        })}

        {isSuperAdmin && !loading && (
          <>
            <div className="my-3 border-t border-gray-100 dark:border-slate-800" />
            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">
              Super-admin
            </p>
            <Link
              href="/admin/companies"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                pathname.startsWith('/admin/companies')
                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
              )}
            >
              <Globe className="h-5 w-5 text-purple-500" />
              Empresas (todas)
            </Link>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 px-4 py-4 dark:border-slate-700">
        <button
          onClick={toggle}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600
                     hover:bg-gray-100 hover:text-gray-900 transition-colors
                     dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {isDark
            ? <Sun  className="h-4 w-4 text-amber-400" />
            : <Moon className="h-4 w-4 text-slate-400" />
          }
          <span>{isDark ? 'Modo claro' : 'Modo oscuro'}</span>
        </button>
        <button
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500
                     hover:bg-red-50 hover:text-red-600 transition-colors
                     dark:text-slate-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar sesión</span>
        </button>
        <p className="mt-2 px-3 text-xs text-gray-400 dark:text-slate-600">v0.1.0 · Beta privada</p>
      </div>
    </aside>
  );
}
