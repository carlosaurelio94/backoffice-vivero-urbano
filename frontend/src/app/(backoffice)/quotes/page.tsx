'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Trash2, ChevronDown } from 'lucide-react';
import { useQuotes, useUpdateQuoteStatus, useDeleteQuote } from '@/hooks/useQuotes';
import { Badge }  from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal }  from '@/components/ui/Modal';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Quote, QuoteStatus } from '@/types';

const PAGE_SIZE = 15;

const STATUS_OPTIONS: { value: QuoteStatus; label: string }[] = [
  { value: 'draft',    label: 'Borrador'  },
  { value: 'sent',     label: 'Enviado'   },
  { value: 'approved', label: 'Aprobado'  },
  { value: 'rejected', label: 'Rechazado' },
];

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: 7 }).map((_, j) => (
            <td key={j} className="px-6 py-4">
              <div className="h-4 rounded bg-gray-200 dark:bg-slate-700" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function DeleteModal({ quote, onClose }: { quote: Quote | null; onClose: () => void }) {
  const deleteMutation = useDeleteQuote();
  const handleDelete = async () => {
    if (!quote) return;
    await deleteMutation.mutateAsync(quote.id);
    onClose();
  };
  return (
    <Modal open={!!quote} onClose={onClose} title="Eliminar presupuesto" size="sm">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600 dark:text-slate-300">
          ¿Eliminár el presupuesto{' '}
          <span className="font-semibold text-gray-900 dark:text-slate-100">#{quote?.quote_number}</span>?
        </p>
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-slate-700">
          <Button variant="secondary" onClick={onClose} disabled={deleteMutation.isPending}>Cancelar</Button>
          <Button variant="danger" loading={deleteMutation.isPending} onClick={handleDelete}>Eliminar</Button>
        </div>
      </div>
    </Modal>
  );
}

function StatusSelector({ quote }: { quote: Quote }) {
  const updateStatus = useUpdateQuoteStatus();
  return (
    <div className="relative inline-flex items-center">
      <Badge variant={quote.status} />
      <select
        value={quote.status}
        onChange={(e) => updateStatus.mutate({ id: quote.id, status: e.target.value as QuoteStatus })}
        disabled={updateStatus.isPending}
        className="absolute inset-0 w-full cursor-pointer opacity-0"
        title="Cambiar estado"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="ml-1 h-3 w-3 text-gray-400 pointer-events-none dark:text-slate-500" />
    </div>
  );
}

export default function QuotesPage() {
  const router = useRouter();
  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Quote | null>(null);

  const { data, isLoading, isError } = useQuotes({
    page, pageSize: PAGE_SIZE,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Presupuestos</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            {data ? `${data.total} presupuesto${data.total !== 1 ? 's' : ''} en total` : 'Historial y gestión de presupuestos'}
          </p>
        </div>
        <Button onClick={() => router.push('/quotes/new')}>
          <Plus className="h-4 w-4" />
          Nuevo presupuesto
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por cliente..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm
                       focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500
                       dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700
                     focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500
                     dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
        >
          <option value="">Todos los estados</option>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                {['#', 'Cliente', 'Fecha', 'Ítems', 'Total', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className={`px-6 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400 ${h === 'Acciones' || h === 'Total' ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white dark:divide-slate-700 dark:bg-slate-800">

              {isLoading && <TableSkeleton />}

              {isError && (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-sm text-red-500">
                  Error al cargar los presupuestos.
                </td></tr>
              )}

              {!isLoading && !isError && data?.data.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-400 dark:text-slate-500">
                  {search || statusFilter ? 'No se encontraron presupuestos.' : 'Todavía no hay presupuestos. ¡Creá el primero!'}
                </td></tr>
              )}

              {!isLoading && data?.data.map((quote) => (
                <tr key={quote.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer dark:hover:bg-slate-700/50"
                  onClick={() => router.push(`/quotes/${quote.id}`)}>
                  <td className="px-6 py-4 font-mono font-semibold text-sm text-gray-800 dark:text-slate-200">
                    #{String(quote.quote_number).padStart(4, '0')}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-slate-100">{quote.client?.name ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">{formatDate(quote.quote_date)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">{quote.item_count}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right dark:text-slate-100">
                    {formatCurrency(quote.total_amount, quote.currency)}
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <StatusSelector quote={quote} />
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setDeleteTarget(quote)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors dark:hover:bg-red-900/30 dark:hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3 dark:border-slate-700">
            <p className="text-xs text-gray-500 dark:text-slate-400">Página {page} de {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
              <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Siguiente</Button>
            </div>
          </div>
        )}
      </div>

      <DeleteModal quote={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </div>
  );
}
