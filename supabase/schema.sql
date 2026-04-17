-- ============================================================
-- Vivero Urbano Backoffice — Schema SQL
-- Ejecutar en Supabase: SQL Editor → New query → Run
-- ============================================================

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ────────────────────────────────────────────────────────────
-- Tabla: clients
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(120) NOT NULL,
    address       VARCHAR(200),
    rif           VARCHAR(20),
    phone         VARCHAR(20),
    client_status VARCHAR(20)  NOT NULL DEFAULT 'prospect'
                              CHECK (client_status IN ('prospect', 'client')),
    created_by    VARCHAR(80)  NOT NULL,
    updated_by    VARCHAR(80),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ,
    deleted       BOOLEAN      NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_clients_deleted       ON clients (deleted);
CREATE INDEX IF NOT EXISTS idx_clients_client_status ON clients (client_status);
CREATE INDEX IF NOT EXISTS idx_clients_name          ON clients (name);

-- ────────────────────────────────────────────────────────────
-- Tabla: quote_information  (presets de texto)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quote_information (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(80)  NOT NULL,
    information TEXT         NOT NULL,
    created_by  VARCHAR(80)  NOT NULL,
    updated_by  VARCHAR(80),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ,
    deleted     BOOLEAN      NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_quote_information_deleted ON quote_information (deleted);

-- ────────────────────────────────────────────────────────────
-- Tabla: quotes
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quotes (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id      UUID          NOT NULL REFERENCES clients(id),
    information_id UUID          REFERENCES quote_information(id),
    quote_number   INTEGER       NOT NULL,
    quote_date     DATE          NOT NULL,
    total_amount   NUMERIC(12,2) NOT NULL DEFAULT 0,
    item_count     INTEGER       NOT NULL DEFAULT 0,
    currency       VARCHAR(5)    NOT NULL DEFAULT '$',
    status         VARCHAR(20)   NOT NULL DEFAULT 'draft'
                                 CHECK (status IN ('draft', 'sent', 'approved', 'rejected')),
    created_by     VARCHAR(80)   NOT NULL,
    updated_by     VARCHAR(80),
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ,
    deleted        BOOLEAN       NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_quotes_deleted    ON quotes (deleted);
CREATE INDEX IF NOT EXISTS idx_quotes_client_id  ON quotes (client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status     ON quotes (status);
CREATE INDEX IF NOT EXISTS idx_quotes_date       ON quotes (quote_date DESC);

-- ────────────────────────────────────────────────────────────
-- Tabla: quote_items
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quote_items (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id       UUID          NOT NULL REFERENCES quotes(id),
    client_id      UUID          NOT NULL REFERENCES clients(id),
    information_id UUID          REFERENCES quote_information(id),
    quantity       INTEGER       NOT NULL CHECK (quantity > 0),
    product        VARCHAR(200)  NOT NULL,
    unit_price     NUMERIC(12,2) NOT NULL,
    total_price    NUMERIC(12,2) NOT NULL,
    created_by     VARCHAR(80)   NOT NULL,
    updated_by     VARCHAR(80),
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ,
    deleted        BOOLEAN       NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items (quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_deleted  ON quote_items (deleted);
