// ─── Domain Types (matching DB schema) ──────────────────────────────────────

export type ClientStatus = 'prospect' | 'client';
export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected';

export interface Client {
  id: string;
  name: string;
  address?: string | null;
  rif?: string | null;
  phone?: string | null;
  client_status: ClientStatus;
  created_by: string;
  updated_by?: string | null;
  created_at: string;
  updated_at?: string | null;
  deleted: boolean;
}

export interface QuoteInformation {
  id: string;
  name: string;
  information: string;
  created_by: string;
  updated_by?: string | null;
  created_at: string;
  updated_at?: string | null;
  deleted: boolean;
}

export interface Quote {
  id: string;
  client_id: string;
  information_id?: string | null;
  quote_number: number;
  quote_date: string;
  total_amount: number;
  item_count: number;
  currency: string;
  status: QuoteStatus;
  created_by: string;
  updated_by?: string | null;
  created_at: string;
  updated_at?: string | null;
  deleted: boolean;
  // Relations (joined)
  client?: Client;
  information?: QuoteInformation;
  items?: QuoteItem[];
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  client_id: string;
  information_id?: string | null;
  quantity: number;
  product: string;
  unit_price: number;
  total_price: number;
  created_by: string;
  updated_by?: string | null;
  created_at: string;
  updated_at?: string | null;
  deleted: boolean;
}

// ─── Form / DTO Types ────────────────────────────────────────────────────────

export interface CreateClientDTO {
  name: string;
  address?: string;
  rif?: string;
  phone?: string;
  client_status: ClientStatus;
}

export interface UpdateClientDTO extends Partial<CreateClientDTO> {}

export interface CreateQuoteItemDTO {
  quantity: number;
  product: string;
  unit_price: number;
  total_price: number;
}

export interface CreateQuoteDTO {
  client_id: string;
  information_id?: string;
  quote_number: number;
  quote_date: string;
  total_amount: number;
  item_count: number;
  currency: string;
  status: QuoteStatus;
  items: CreateQuoteItemDTO[];
}

// ─── UI / Pagination ─────────────────────────────────────────────────────────

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type SortDirection = 'asc' | 'desc';
