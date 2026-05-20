import { Sidebar } from '@/components/layout/Sidebar';
import { PermissionsProvider } from '@/context/PermissionsContext';
import { CompanyProvider } from '@/context/CompanyContext';

export default function BackofficeLayout({ children }: { children: React.ReactNode }) {
  return (
    <CompanyProvider>
      <PermissionsProvider>
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="p-8">{children}</div>
          </main>
        </div>
      </PermissionsProvider>
    </CompanyProvider>
  );
}
