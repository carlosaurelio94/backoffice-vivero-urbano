-- ============================================================
-- MÓDULO PROVEEDORES Y FACTURAS - Vivero Urbano Backoffice
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ─── PROVEEDORES ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS suppliers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name   TEXT NOT NULL,
  fantasy_name TEXT,
  tax_id       TEXT,          -- CUIT/VAT/RUC/NIF (genérico)
  category     TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplier_contacts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id    UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  name           TEXT,
  email          TEXT,
  phone          TEXT,
  role           TEXT,    -- cargo
  notify_payment BOOLEAN DEFAULT false,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplier_bank_accounts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id    UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  account_type   TEXT NOT NULL DEFAULT 'CBU',  -- CBU, CVU, CLABE, IBAN, etc.
  account_number TEXT NOT NULL,
  bank_name      TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ESTADOS DE FACTURA ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS invoice_statuses (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

INSERT INTO invoice_statuses (id, name) VALUES
  (1,  'En revisión'),
  (2,  'Pendiente de aprobación y Cargar retenciones'),
  (3,  'Cargar retenciones'),
  (4,  'Pendiente de aprobación'),
  (5,  'Asignar fecha de pago'),
  (6,  'Pago retrasado'),
  (7,  'Esperando pago'),
  (8,  'Pagado'),
  (9,  'Rechazado'),
  (10, 'Creación'),
  (11, 'Transferencia rebotada'),
  (12, 'Cheque emitido'),
  (13, 'Disponible para uso'),
  (14, 'Aplicada'),
  (15, 'Aprobado'),
  (16, 'Anulado'),
  (17, 'Pendiente de aprobación por Gerencia General')
ON CONFLICT (id) DO NOTHING;

-- ─── FACTURAS ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS invoices (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id          UUID NOT NULL REFERENCES suppliers(id),
  invoice_type         TEXT NOT NULL DEFAULT 'factura',   -- factura | nota_credito | nota_debito
  invoice_number       TEXT NOT NULL,
  issue_date           DATE,
  due_date             DATE,
  currency             TEXT NOT NULL DEFAULT 'ARS',       -- ARS | USD | EUR | BRL
  total_amount         NUMERIC(15,2) NOT NULL DEFAULT 0,
  taxable_amount       NUMERIC(15,2),
  tax_amount           NUMERIC(15,2),
  retention_amount     NUMERIC(15,2) DEFAULT 0,
  credit_notes_amount  NUMERIC(15,2) DEFAULT 0,
  payment_method       TEXT,                              -- transferencia | tarjeta | cheque | efectivo
  installments         INTEGER NOT NULL DEFAULT 1,
  status_id            INTEGER NOT NULL DEFAULT 1 REFERENCES invoice_statuses(id),
  sector               TEXT,
  budget_item          TEXT,
  rejection_reason     TEXT,
  rejection_type       TEXT,
  file_url             TEXT,    -- Google Drive URL (futuro)
  exchange_rate_official NUMERIC(12,4),
  exchange_rate_card     NUMERIC(12,4),
  original_amount        NUMERIC(15,2),
  original_currency      TEXT,
  scheduled_payment_date DATE,
  payment_date           DATE,
  imputation_date        DATE,
  created_by           UUID,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Cuotas individuales (cada cuota aparece como fila separada en el listado)
CREATE TABLE IF NOT EXISTS invoice_installments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id          UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  installment_number  INTEGER NOT NULL,  -- 1-based
  amount              NUMERIC(15,2) NOT NULL,
  due_date            DATE,
  status_id           INTEGER NOT NULL DEFAULT 1 REFERENCES invoice_statuses(id),
  scheduled_payment_date DATE,
  payment_date        DATE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Historial de estados por factura
CREATE TABLE IF NOT EXISTS invoice_status_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id  UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  status_id   INTEGER NOT NULL REFERENCES invoice_statuses(id),
  notes       TEXT,
  changed_by  UUID,
  changed_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ÍNDICES ─────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_suppliers_legal_name    ON suppliers(legal_name);
CREATE INDEX IF NOT EXISTS idx_supplier_contacts_sid   ON supplier_contacts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_invoices_supplier       ON invoices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status         ON invoices(status_id);
CREATE INDEX IF NOT EXISTS idx_invoice_installments_inv ON invoice_installments(invoice_id);

-- ─── RLS ─────────────────────────────────────────────────────

ALTER TABLE suppliers                ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_contacts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_bank_accounts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_statuses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_installments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_status_history   ENABLE ROW LEVEL SECURITY;

-- Autenticados pueden hacer todo en proveedores y facturas
-- (la lógica de roles se maneja en el frontend vía usePermissions)
CREATE POLICY "auth_all_suppliers"          ON suppliers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_supplier_contacts"  ON supplier_contacts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_bank_accounts"      ON supplier_bank_accounts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_select_invoice_statuses" ON invoice_statuses
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_all_invoices"           ON invoices
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_installments"       ON invoice_installments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_status_history"     ON invoice_status_history
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
