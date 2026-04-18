'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Leaf,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/clients',   label: 'Clientes',       icon: Users },
  { href: '/quotes',    label: 'Presupuestos',   icon: FileText },
  { href: '/settings',  label: 'Configuración',  icon: Settings },
];

export function Sidebar() {
  const pathname    = usePathname();
  const router      = useRouter();
  const { isDark, toggle } = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">

      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-6 dark:border-slate-700">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
          <Leaf className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-slate-100">Vivero Urbano</p>
          <p className="text-xs text-gray-500 dark:text-slate-400">Backoffice</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
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
      </nav>

      {/* Footer: versión + toggle */}
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
