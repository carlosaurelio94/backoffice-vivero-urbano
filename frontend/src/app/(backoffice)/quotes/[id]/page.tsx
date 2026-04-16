'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Hash, Layers } from 'lucide-react';
import { getQuoteById } from '@/lib/quotes';
import { Badge }  from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, formatCurrency } from '@/lib/utils';

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="h-8 w-48 rounded bg-gray-200" />
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="mb-3 h-5 rounded bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router  = useRouter();

  const { data: quote, isLoading, isError } = useQuery({
    queryKey: ['quotes', 'detail', id],
    queryFn:  () => getQuoteById(id),
  });

  if (isLoading) return <DetailSkeleton />;

  if (isError || !quote) {
    return (
      <div className="flex flex-col items-center gap-4 pt-16">
        <p className="text-gray-500">No se encontró el presupuesto.</p>
        <Button variant="secondary" onClick={() => router.push('/quotes')}>
          Volver a la lista
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                Presupuesto #{String(quote.quote_number).padStart(4, '0')}
              </h1>
              <Badge variant={quote.status} />
            </div>
            <p className="mt-0.5 text-sm text-gray-500">{quote.client?.name}</p>
          </div>
        </div>
      </div>

      {/* ── Info general ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: Hash,     label: 'N° presupuesto', value: `#${String(quote.quote_number).padStart(4, '0')}` },
          { icon: Calendar, label: 'Fecha',           value: formatDate(quote.quote_date) },
          { icon: Layers,   label: 'Ítems',           value: String(quote.item_count) },
          { icon: null,     label: 'Moneda',          value: quote.currency },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Tabla de ítems ── */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Ítems</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Producto / Servicio</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Cant.</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Precio unit.</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {quote.items?.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 text-sm text-gray-900">{item.product}</td>
                <td className="px-6 py-4 text-sm text-right text-gray-600">{item.quantity}</td>
                <td className="px-6 py-4 text-sm text-right text-gray-600">
                  {formatCurrency(item.unit_price, quote.currency)}
                </td>
                <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                  {formatCurrency(item.total_price, quote.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div className="flex justify-end border-t border-gray-200 px-6 py-4">
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(quote.total_amount, quote.currency)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Texto informativo ── */}
      {quote.information && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Información adicional — {quote.information.name}
          </h2>
          <p className="whitespace-pre-wrap text-sm text-gray-600">{quote.information.information}</p>
        </div>
      )}
    </div>
  );
}
