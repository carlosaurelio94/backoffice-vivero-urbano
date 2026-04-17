'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Pencil, FileText, Phone, MapPin, Hash } from 'lucide-react';
import { getClientById } from '@/lib/clients';
import { getQuotes } from '@/lib/quotes';
import { ClientForm } from '@/components/clients/ClientForm';
import { Badge }  from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Client } from '@/types';

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse max-w-4xl">
      <div className="h-8 w-48 rounded bg-gray-200 dark:bg-slate-700" />
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="mb-3 h-5 rounded bg-gray-200 dark:bg-slate-700" />)}
      </div>
    </div>
  );
}

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router  = useRouter();
  const [editOpen, setEditOpen] = useState(false);

  const { data: client, isLoading, isError } = useQuery({
    queryKey: ['clients', 'detail', id],
    queryFn:  () => getClientById(id),
  });

  // Presupuestos del cliente — carga solo cuando tenemos el cliente
  const { data: quotesData } = useQuery({
    queryKey: ['quotes', 'byClient', id],
    queryFn:  () => getQuotes({ page: 1, pageSize: 100, clientId: id }),
    enabled:  !!client,
  });

  if (isLoading) return <DetailSkeleton />;

  if (isError || !client) {
    return (
      <div className="flex flex-col items-center gap-4 pt-16">
        <p className="text-gray-500 dark:text-slate-400">No se encontró el cliente.</p>
        <Button variant="secondary" onClick={() => router.push('/clients')}>Volver a la lista</Button>
      </div>
    );
  }

  const infoItems = [
    { icon: Hash,   label: 'RIF',       value: client.rif     ?? '—' },
    { icon: Phone,  label: 'Teléfono',  value: client.phone   ?? '—' },
    { icon: MapPin, label: 'Dirección', value: client.address ?? '—' },
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{client.name}</h1>
              <Badge variant={client.client_status} />
            </div>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">
              Registrado el {formatDate(client.created_at)}
            </p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
      </div>

      {/* Datos del cliente */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">Datos de contacto</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {infoItems.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <span className="mt-0.5 rounded-lg bg-gray-100 p-2 dark:bg-slate-700">
                <Icon className="h-4 w-4 text-gray-500 dark:text-slate-400" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-slate-500">{label}</p>
                <p className="mt-0.5 text-sm font-medium text-gray-900 dark:text-slate-100">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Presupuestos del cliente */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-400 dark:text-slate-500" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
              Presupuestos ({quotesData?.total ?? 0})
            </h2>
          </div>
          <Button size="sm" onClick={() => router.push('/quotes/new')}>
            Nuevo presupuesto
          </Button>
        </div>

        <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-700/50">
            <tr>
              {['#', 'Fecha', 'Total', 'Estado'].map((h) => (
                <th key={h} className={`px-6 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400 ${h === 'Total' ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {!quotesData || quotesData.data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400 dark:text-slate-500">
                  Este cliente no tiene presupuestos todavía.
                </td>
              </tr>
            ) : (
              quotesData.data.map((quote) => (
                <tr key={quote.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer dark:hover:bg-slate-700/50"
                  onClick={() => router.push(`/quotes/${quote.id}`)}>
                  <td className="px-6 py-4 font-mono font-semibold text-sm text-gray-800 dark:text-slate-200">
                    #{String(quote.quote_number).padStart(4, '0')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">{formatDate(quote.quote_date)}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right dark:text-slate-100">
                    {formatCurrency(quote.total_amount, quote.currency)}
                  </td>
                  <td className="px-6 py-4"><Badge variant={quote.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de edición */}
      <ClientForm open={editOpen} onClose={() => setEditOpen(false)} client={client as Client} />
    </div>
  );
}
