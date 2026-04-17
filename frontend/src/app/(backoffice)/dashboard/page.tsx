'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, FileText, DollarSign, Clock, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Badge }  from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { QuoteStatus } from '@/types';

interface DashboardMetrics {
  totalClients:     number;
  quotesThisMonth:  number;
  revenueThisMonth: number;
  pendingQuotes:    number;
  recentQuotes: {
    id: string; quote_number: number; quote_date: string;
    total_amount: number; currency: string; status: QuoteStatus;
    client: { name: string } | null;
  }[];
}

async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const now        = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

  const [clientsRes, quotesMonthRes, pendingRes, recentRes] = await Promise.all([
    supabase.from('clients').select('id', { count: 'exact', head: true }).eq('deleted', false),
    supabase.from('quotes').select('total_amount, currency').eq('deleted', false).gte('quote_date', monthStart).lte('quote_date', monthEnd),
    supabase.from('quotes').select('id', { count: 'exact', head: true }).eq('deleted', false).eq('status', 'sent'),
    supabase.from('quotes').select('id, quote_number, quote_date, total_amount, currency, status, client:clients(name)').eq('deleted', false).order('created_at', { ascending: false }).limit(5),
  ]);

  if (clientsRes.error)     throw clientsRes.error;
  if (quotesMonthRes.error) throw quotesMonthRes.error;
  if (pendingRes.error)     throw pendingRes.error;
  if (recentRes.error)      throw recentRes.error;

  const revenueThisMonth = (quotesMonthRes.data ?? [])
    .filter((q) => q.currency === '$')
    .reduce((sum, q) => sum + (q.total_amount ?? 0), 0);

  const recentQuotes: DashboardMetrics['recentQuotes'] = (recentRes.data ?? []).map((q) => ({
    id:           q.id,
    quote_number: q.quote_number,
    quote_date:   q.quote_date,
    total_amount: q.total_amount,
    currency:     q.currency,
    status:       q.status as QuoteStatus,
    client:       Array.isArray(q.client) ? (q.client[0] ?? null) : (q.client ?? null),
  }));

  return {
    totalClients:     clientsRes.count     ?? 0,
    quotesThisMonth:  quotesMonthRes.data?.length ?? 0,
    revenueThisMonth,
    pendingQuotes:    pendingRes.count     ?? 0,
    recentQuotes,
  };
}

async function exportMetricsToCSV() {
  const { data, error } = await supabase
    .from('quotes')
    .select('quote_number, quote_date, total_amount, currency, status, client:clients(name)')
    .eq('deleted', false)
    .order('quote_date', { ascending: false });

  if (error || !data) return;

  type ExportRow = { quote_number: number; quote_date: string; total_amount: number; currency: string; status: string; client: { name: string } | { name: string }[] | null };

  const headers = ['N°', 'Cliente', 'Fecha', 'Total', 'Moneda', 'Estado'];
  const rows    = (data as ExportRow[]).map((q) => {
    const clientName = Array.isArray(q.client) ? (q.client[0]?.name ?? '') : (q.client?.name ?? '');
    return [q.quote_number, clientName, q.quote_date, q.total_amount, q.currency, q.status];
  });
  const csv     = [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), { href: url, download: `presupuestos_${new Date().toISOString().slice(0, 10)}.csv` });
  link.click();
  URL.revokeObjectURL(url);
}

function MetricCard({ icon: Icon, label, value, sub, color, iconBg }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color: string; iconBg: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{label}</p>
        <span className={`rounded-lg p-2 ${iconBg}`}><Icon className={`h-5 w-5 ${color}`} /></span>
      </div>
      <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-slate-100">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">{sub}</p>}
    </div>
  );
}

function MetricSkeleton() {
  return <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 h-32 shadow-sm dark:border-slate-700 dark:bg-slate-800" />;
}

export default function DashboardPage() {
  const now      = new Date();
  const monthName = now.toLocaleDateString('es-VE', { month: 'long', year: 'numeric' });

  const { data: metrics, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn:  fetchDashboardMetrics,
    staleTime: 2 * 60 * 1000,
  });

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 capitalize dark:text-slate-400">{monthName}</p>
        </div>
        <Button variant="secondary" onClick={exportMetricsToCSV}>
          <Download className="h-4 w-4" />
          Exportar a CSV
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <MetricSkeleton key={i} />)
        ) : isError ? (
          <div className="sm:col-span-2 lg:col-span-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
            Error al cargar las métricas.
          </div>
        ) : (
          <>
            <MetricCard icon={Users}      label="Clientes totales"        value={String(metrics!.totalClients)}     color="text-blue-600 dark:text-blue-400"   iconBg="bg-blue-50 dark:bg-blue-900/30" />
            <MetricCard icon={FileText}   label="Presupuestos este mes"   value={String(metrics!.quotesThisMonth)}  color="text-green-600 dark:text-green-400" iconBg="bg-green-50 dark:bg-green-900/30" sub={`Mes de ${monthName}`} />
            <MetricCard icon={DollarSign} label="Facturado este mes"      value={formatCurrency(metrics!.revenueThisMonth)} color="text-purple-600 dark:text-purple-400" iconBg="bg-purple-50 dark:bg-purple-900/30" sub="Solo en USD ($)" />
            <MetricCard icon={Clock}      label="Enviados sin respuesta"  value={String(metrics!.pendingQuotes)}    color="text-amber-600 dark:text-amber-400"  iconBg="bg-amber-50 dark:bg-amber-900/30" sub="Estado: enviado" />
          </>
        )}
      </div>

      {/* Actividad reciente */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-slate-100">Últimos presupuestos</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-700/50">
            <tr>
              {['#', 'Cliente', 'Fecha', 'Total', 'Estado'].map((h) => (
                <th key={h} className={`px-6 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400 ${h === 'Total' ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-6 py-4"><div className="h-4 rounded bg-gray-200 dark:bg-slate-700" /></td>
                  ))}
                </tr>
              ))
            ) : metrics?.recentQuotes.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400 dark:text-slate-500">No hay presupuestos todavía.</td></tr>
            ) : (
              metrics?.recentQuotes.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50 transition-colors dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 font-mono font-semibold text-sm text-gray-800 dark:text-slate-200">#{String(q.quote_number).padStart(4, '0')}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-slate-100">{q.client?.name ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">{formatDate(q.quote_date)}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right dark:text-slate-100">{formatCurrency(q.total_amount, q.currency)}</td>
                  <td className="px-6 py-4"><Badge variant={q.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
