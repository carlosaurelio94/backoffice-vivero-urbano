# Backoffice multi-tenant

Backoffice SaaS multi-empresa: clientes, presupuestos, proveedores y facturas.
Cada empresa (tenant) ve únicamente sus propios datos vía Row Level Security.
La empresa piloto es Vivero Urbano.

## Arquitectura

```
backoffice-vivero-urbano/
├── frontend/          # Next.js 16 + Tailwind CSS + Supabase JS
├── backend/           # Spring Boot 3.3 + Java 21 + JPA
├── supabase/          # Schema SQL + políticas RLS
└── .github/workflows/ # CI/CD (GitHub Actions)
```

**Stack:**
- **Frontend:** Next.js 16 (App Router), Tailwind CSS v4, TanStack Query v5, React Hook Form + Zod, Sonner, jsPDF
- **Backend:** Spring Boot 3.3, Java 21, Spring Data JPA, MapStruct, Lombok, Springdoc OpenAPI
- **Base de datos:** Supabase (PostgreSQL)
- **Deploy:** Vercel (frontend) + Render (backend)

## Funcionalidades

- **Clientes** — CRUD completo, estados (prospecto / cliente), búsqueda y filtros
- **Presupuestos** — creación con ítems, importación de lista por texto, cambio de estado inline, exportación PDF
- **Proveedores + Facturas** — circuito completo de compras
- **Configuración** — presets de texto informativo reutilizables en presupuestos
- **Dashboard** — métricas del mes, actividad reciente, exportar CSV
- **Dark mode** — toggle persistido en localStorage, sin flash al recargar
- **Autenticación** — login con Supabase Auth, rutas protegidas por middleware
- **Multi-tenancy** — cada empresa (tenant) ve sólo sus datos. RLS estricto.
- **Onboarding self-service** — cualquiera puede crear su empresa en `/register`
- **Switcher de empresa** — si el user pertenece a varias, salto rápido sin re-loguear
- **Branding por empresa** — nombre, logo y color (también en login con `?company=slug`)
- **Planes** — Free / Pro / Enterprise con límites y página de billing
- **Super-admin global** — vista cross-tenant para el operador del SaaS (`/admin/companies`)

## Desarrollo local

### Requisitos

- Node.js 20+
- Java 21 + Maven 3.9+
- Cuenta de Supabase

### Frontend

```bash
cd frontend
cp .env.example .env.local
# Completar variables en .env.local
npm install
npm run dev
```

### Backend

```bash
cd backend
export DB_URL=jdbc:postgresql://db.xxx.supabase.co:5432/postgres
export DB_USERNAME=postgres
export DB_PASSWORD=tu_password
export ALLOWED_ORIGINS=http://localhost:3000
mvn spring-boot:run
```

## Variables de entorno

### Frontend (`frontend/.env.local`)

| Variable | Descripción | Dónde encontrarla |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key pública | Supabase → Settings → API |
| `NEXT_PUBLIC_API_URL` | URL del backend (opcional) | URL de Render |

### Backend

| Variable | Descripción |
|---|---|
| `DB_URL` | `jdbc:postgresql://db.xxx.supabase.co:5432/postgres` |
| `DB_USERNAME` | `postgres` |
| `DB_PASSWORD` | Password de Supabase |
| `ALLOWED_ORIGINS` | URL del frontend en Vercel |

## Base de datos

Setup completo desde cero (incluye tablas, RLS, roles, permisos y vista de compat):

```
Supabase → SQL Editor → pegar supabase/schema.sql → Run
```

Crear primera empresa + usuario administrador (editar los valores arriba):

```
Supabase → SQL Editor → pegar supabase/seed.sql → editar → Run
```

### Multi-tenancy

Cada empresa es un registro en `companies`. Los usuarios pertenecen a una o
más empresas vía `user_companies(user_id, company_id, role_id)`. Todas las
tablas de negocio (`clients`, `quotes`, `quote_items`, `suppliers`,
`invoices`, etc.) llevan `company_id NOT NULL` con default a la empresa
activa del usuario (`current_company_id()`), y RLS que filtra
por `is_member_of(company_id)`.

La empresa activa se guarda en `profiles.current_company_id` y se puede
cambiar desde el switcher del Sidebar cuando el usuario pertenece a varias.

### Agregar una nueva empresa (sin self-service)

```sql
INSERT INTO companies (slug, name, primary_color)
VALUES ('empresa-x', 'Empresa X', '#2563eb');

-- después, asignar usuarios via /admin del backoffice, o:
INSERT INTO user_companies (user_id, company_id, role_id)
VALUES (
  (SELECT id FROM auth.users WHERE email='user@empresa-x.com'),
  (SELECT id FROM companies  WHERE slug='empresa-x'),
  (SELECT id FROM roles      WHERE name='administrador')
);
```

## CI/CD — GitHub Secrets requeridos

Ir a: **GitHub → repo → Settings → Secrets and variables → Actions**

| Secret | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase |
| `RENDER_DEPLOY_HOOK_URL` | Render → servicio → Settings → Deploy Hook |

## Deploy

### Frontend (Vercel)

- Root Directory: `frontend`
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Backend (Render)

- Language: Docker / Root Directory: `backend`
- Env vars: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `ALLOWED_ORIGINS`
- Health check path: `/actuator/health`

## API

Swagger UI: `https://backoffice-vivero-urbano.onrender.com/swagger-ui.html`

Endpoints principales bajo `/api/v1/`:

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/clients` | Listar clientes (paginado) |
| POST | `/clients` | Crear cliente |
| PATCH | `/clients/{id}` | Actualizar cliente |
| DELETE | `/clients/{id}` | Eliminar cliente (soft delete) |
| GET | `/quotes` | Listar presupuestos |
| POST | `/quotes` | Crear presupuesto |
| PATCH | `/quotes/{id}/status` | Cambiar estado |
| GET | `/quote-information` | Listar presets de texto |
