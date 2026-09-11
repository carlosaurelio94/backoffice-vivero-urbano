'use client';

import { use } from 'react';
import type React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Hash, Layers, FileDown } from 'lucide-react';
import { getQuoteById } from '@/lib/quotes';
import { generateQuotePdf } from '@/lib/generateQuotePdf';
import { useCompany } from '@/context/CompanyContext';
import { Badge }  from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, formatCurrency } from '@/lib/utils';

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse max-w-4xl">
      <div className="h-8 w-48 rounded bg-gray-200 dark:bg-slate-700" />
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="mb-3 h-5 rounded bg-gray-200 dark:bg-slate-700" />)}
      </div>
    </div>
  );
}

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router  = useRouter();
  const { current: company } = useCompany();

  const { data: quote, isLoading, isError } = useQuery({
    queryKey: ['quotes', 'detail', id],
    queryFn:  () => getQuoteById(id),
  });

  if (isLoading) return <DetailSkeleton />;

  if (isError || !quote) {
    return (
      <div className="flex flex-col items-center gap-4 pt-16">
        <p className="text-gray-500 dark:text-slate-400">No se encontró el presupuesto.</p>
        <Button variant="secondary" onClick={() => router.back()}>Volver a la lista</Button>
      </div>
    );
  }

  const infoCards: { icon: React.ElementType | null; label: string; value: string }[] = [
    { icon: Hash,     label: 'N° presupuesto', value: `#${String(quote.quote_number).padStart(4, '0')}` },
    { icon: Calendar, label: 'Fecha',           value: formatDate(quote.quote_date) },
    { icon: Layers,   label: 'Ítems',           value: String(quote.item_count) },
    { icon: null,     label: 'Moneda',          value: quote.currency },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors dark:hover:bg-slate-800 dark:hover:text-slate-200">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                Presupuesto #{String(quote.quote_number).padStart(4, '0')}
              </h1>
              <Badge variant={quote.status} />
            </div>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">{quote.client?.name}</p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => generateQuotePdf(quote, company?.name)}>
          <FileDown className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {infoCards.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center gap-1.5">
              {Icon && <Icon className="h-3.5 w-3.5 text-gray-400 dark:text-slate-500" />}
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">{label}</p>
            </div>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-slate-100">{value}</p>
          </div>
        ))}
      </div>

      {/* Tabla de ítems */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-slate-700">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">Ítems</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-700/50">
            <tr>
              {['Producto / Servicio', 'Cant.', 'Precio unit.', 'Total'].map((h) => (
                <th key={h} className={`px-6 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400 ${['Cant.', 'Precio unit.', 'Total'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {quote.items?.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-100">{item.product}</td>
                <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-slate-300">{item.quantity}</td>
                <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-slate-300">{formatCurrency(item.unit_price, quote.currency)}</td>
                <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900 dark:text-slate-100">{formatCurrency(item.total_price, quote.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end border-t border-gray-200 px-6 py-4 dark:border-slate-700">
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{formatCurrency(quote.total_amount, quote.currency)}</p>
          </div>
        </div>
      </div>

      {/* Texto informativo */}
      {quote.information && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
            Información adicional — {quote.information.name}
          </h2>
          <p className="whitespace-pre-wrap text-sm text-gray-600 dark:text-slate-300">{quote.information.information}</p>
        </div>
      )}
    </div>
  );
}
