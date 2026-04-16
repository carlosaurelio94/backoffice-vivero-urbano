'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getQuotes,
  createQuote,
  updateQuoteStatus,
  deleteQuote,
  getNextQuoteNumber,
} from '@/lib/quotes';
import type { CreateQuoteDTO, QuoteStatus } from '@/types';

export const quoteKeys = {
  all:        ['quotes'] as const,
  list:       (params: object) => ['quotes', 'list', params] as const,
  detail:     (id: string)     => ['quotes', 'detail', id] as const,
  nextNumber: ['quotes', 'nextNumber'] as const,
};

// ─── List ─────────────────────────────────────────────────────────────────────
interface UseQuotesParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
}

export function useQuotes(params: UseQuotesParams) {
  return useQuery({
    queryKey: quoteKeys.list(params),
    queryFn:  () => getQuotes(params),
    placeholderData: (prev) => prev,
  });
}

// ─── Próximo número de presupuesto ────────────────────────────────────────────
export function useNextQuoteNumber() {
  return useQuery({
    queryKey: quoteKeys.nextNumber,
    queryFn:  getNextQuoteNumber,
    // No necesita refetch frecuente — solo cuando se crea un presupuesto
    staleTime: 0,
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────
export function useCreateQuote() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateQuoteDTO) => createQuote(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: quoteKeys.all });
    },
  });
}

// ─── Update Status ────────────────────────────────────────────────────────────
export function useUpdateQuoteStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: QuoteStatus }) =>
      updateQuoteStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: quoteKeys.all });
    },
  });
}

// ─── Delete (soft) ────────────────────────────────────────────────────────────
export function useDeleteQuote() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteQuote(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: quoteKeys.all });
    },
  });
}
