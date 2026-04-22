export interface Supplier {
  id:           string;
  legal_name:   string;
  fantasy_name: string | null;
  tax_id:       string | null;
  category:     string | null;
  notes:        string | null;
  created_at:   string;
  updated_at:   string;
}

export interface SupplierContact {
  id:             string;
  supplier_id:    string;
  name:           string | null;
  email:          string | null;
  phone:          string | null;
  role:           string | null;
  notify_payment: boolean;
}

export interface SupplierBankAccount {
  id:             string;
  supplier_id:    string;
  account_type:   string;  // CBU, CVU, CLABE, IBAN, etc.
  account_number: string;
  bank_name:      string | null;
}

export interface SupplierWithDetails extends Supplier {
  contacts:      SupplierContact[];
  bank_accounts: SupplierBankAccount[];
}

// ─── FACTURAS ────────────────────────────────────────────────

export type InvoiceType     = 'factura' | 'nota_credito' | 'nota_debito';
export type PaymentMethod   = 'transferencia' | 'tarjeta' | 'cheque' | 'efectivo';
export type Currency        = 'ARS' | 'USD' | 'EUR' | 'BRL' | 'UYU';

export interface InvoiceStatus {
  id:   number;
  name: string;
}

// Mapa de colores por status id
export const STATUS_COLORS: Record<number, { bg: string; text: string; dot: string }> = {
  1:  { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-500' },
  4:  { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500' },
  5:  { bg: 'bg-blue-100 dark:bg-blue-900/30',     text: 'text-blue-700 dark:text-blue-300',     dot: 'bg-blue-500'   },
  6:  { bg: 'bg-red-100 dark:bg-red-900/30',       text: 'text-red-700 dark:text-red-300',       dot: 'bg-red-500'    },
  7:  { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500' },
  8:  { bg: 'bg-green-100 dark:bg-green-900/30',   text: 'text-green-700 dark:text-green-300',   dot: 'bg-green-500'  },
  9:  { bg: 'bg-red-100 dark:bg-red-900/30',       text: 'text-red-700 dark:text-red-300',       dot: 'bg-red-600'    },
  15: { bg: 'bg-green-100 dark:bg-green-900/30',   text: 'text-green-700 dark:text-green-300',   dot: 'bg-green-600'  },
  16: { bg: 'bg-gray-100 dark:bg-slate-700',       text: 'text-gray-500 dark:text-slate-400',    dot: 'bg-gray-400'   },
  17: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-600' },
};

export const DEFAULT_STATUS_COLOR = {
  bg: 'bg-gray-100 dark:bg-slate-700',
  text: 'text-gray-600 dark:text-slate-300',
  dot: 'bg-gray-400',
};

export interface Invoice {
  id:                    string;
  supplier_id:           string;
  supplier?:             Pick<Supplier, 'id' | 'legal_name' | 'fantasy_name'>;
  invoice_type:          InvoiceType;
  invoice_number:        string;
  issue_date:            string | null;
  due_date:              string | null;
  currency:              Currency;
  total_amount:          number;
  taxable_amount:        number | null;
  tax_amount:            number | null;
  retention_amount:      number;
  credit_notes_amount:   number;
  payment_method:        PaymentMethod | null;
  installments:          number;
  status_id:             number;
  status?:               InvoiceStatus;
  sector:                string | null;
  budget_item:           string | null;
  rejection_reason:      string | null;
  rejection_type:        string | null;
  file_url:              string | null;
  exchange_rate_official: number | null;
  exchange_rate_card:    number | null;
  original_amount:       number | null;
  original_currency:     string | null;
  scheduled_payment_date: string | null;
  payment_date:          string | null;
  imputation_date:       string | null;
  created_at:            string;
}

export interface InvoiceInstallment {
  id:                 string;
  invoice_id:         string;
  installment_number: number;
  amount:             number;
  due_date:           string | null;
  status_id:          number;
  status?:            InvoiceStatus;
  scheduled_payment_date: string | null;
  payment_date:       string | null;
}

export interface InvoiceStatusHistory {
  id:         string;
  invoice_id: string;
  status_id:  number;
  status?:    InvoiceStatus;
  notes:      string | null;
  changed_by: string | null;
  changed_at: string;
}

export const INVOICE_TYPE_LABELS: Record<InvoiceType, string> = {
  factura:      'Factura',
  nota_credito: 'Nota de Crédito',
  nota_debito:  'Nota de Débito',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  transferencia: 'Transferencia',
  tarjeta:       'Tarjeta',
  cheque:        'Cheque',
  efectivo:      'Efectivo',
};

export const CURRENCY_LABELS: Record<Currency, string> = {
  ARS: 'Peso argentino',
  USD: 'Dólar',
  EUR: 'Euro',
  BRL: 'Real',
  UYU: 'Peso uruguayo',
};

export const REJECTION_TYPES = [
  'Datos incorrectos',
  'Monto incorrecto',
  'Proveedor incorrecto',
  'Factura duplicada',
  'Sin presupuesto asignado',
  'Documentación incompleta',
  'Otro',
];
