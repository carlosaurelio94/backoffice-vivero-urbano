'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClients, createClient, updateClient, deleteClient } from '@/lib/clients';
import type { CreateClientDTO, UpdateClientDTO } from '@/types';

// ─── Query Keys ───────────────────────────────────────────────────────────────
// Centralizar keys evita typos y facilita invalidaciones granulares
export const clientKeys = {
  all:    ['clients'] as const,
  list:   (params: object) => ['clients', 'list', params] as const,
  detail: (id: string)     => ['clients', 'detail', id] as const,
};

// ─── List ─────────────────────────────────────────────────────────────────────
interface UseClientsParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
}

export function useClients(params: UseClientsParams) {
  return useQuery({
    queryKey: clientKeys.list(params),
    queryFn:  () => getClients(params),
    placeholderData: (prev) => prev, // mantiene datos anteriores mientras carga página nueva
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────
export function useCreateClient() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateClientDTO) => createClient(dto),
    onSuccess: () => {
      // Invalida toda la lista para forzar re-fetch
      qc.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}

// ─── Update ───────────────────────────────────────────────────────────────────
export function useUpdateClient() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateClientDTO }) =>
      updateClient(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}

// ─── Delete (soft) ────────────────────────────────────────────────────────────
export function useDeleteClient() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}
