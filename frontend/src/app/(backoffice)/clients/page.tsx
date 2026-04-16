'use client';

import { useState, useCallback } from 'react';
import { Search, Pencil, Trash2, UserPlus } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { ClientForm } from '@/components/clients/ClientForm';
import { DeleteConfirmModal } from '@/components/clients/DeleteConfirmModal';
import { Badge }  from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import type { Client } from '@/types';

const PAGE_SIZE = 15;

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: 6 }).map((_, j) => (
            <td key={j} className="px-6 py-4">
              <div className="h-4 rounded bg-gray-200 dark:bg-slate-700" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function ClientsPage() {
  const [page, setPage]                 = useState(1);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formOpen, setFormOpen]         = useState(false);
  const [deleteOpen, setDeleteOpen]     = useState(false);
  const [selected, setSelected]         = useState<Client | null>(null);

  const { data, isLoading, isError } = useClients({
    page, pageSize: PAGE_SIZE,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  const openCreate = useCallback(() => { setSelected(null); setFormOpen(true); }, []);
  const openEdit   = useCallback((c: Client) => { setSelected(c); setFormOpen(true); }, []);
  const openDelete = useCallback((c: Client) => { setSelected(c); setDeleteOpen(true); }, []);

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Clientes</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            {data ? `${data.total} cliente${data.total !== 1 ? 's' : ''} en total` : 'Gestión de clientes y prospectos'}
          </p>
        </div>
        <Button onClick={openCreate}>
          <UserPlus className="h-4 w-4" />
          Nuevo cliente
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, RIF o teléfono..."
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
          <option value="prospect">Prospectos</option>
          <option value="client">Clientes</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                {['Nombre', 'RIF', 'Teléfono', 'Estado', 'Registrado', 'Acciones'].map((h) => (
                  <th key={h} className={`px-6 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400 ${h === 'Acciones' ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white dark:divide-slate-700 dark:bg-slate-800">

              {isLoading && <TableSkeleton />}

              {isError && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-red-500">
                  Error al cargar los clientes. Verificá la conexión con Supabase.
                </td></tr>
              )}

              {!isLoading && !isError && data?.data.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400 dark:text-slate-500">
                  {search || statusFilter ? 'No se encontraron clientes con ese criterio.' : 'Todavía no hay clientes. ¡Creá el primero!'}
                </td></tr>
              )}

              {!isLoading && data?.data.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-slate-100">{client.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">{client.rif ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">{client.phone ?? '—'}</td>
                  <td className="px-6 py-4"><Badge variant={client.client_status} /></td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">{formatDate(client.created_at)}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(client)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors dark:hover:bg-slate-700 dark:hover:text-slate-200">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => openDelete(client)}
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

        {/* Paginación */}
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

      <ClientForm open={formOpen} onClose={() => setFormOpen(false)} client={selected} />
      <DeleteConfirmModal open={deleteOpen} onClose={() => setDeleteOpen(false)} client={selected} />
    </div>
  );
}
