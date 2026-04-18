# Backoffice — Vivero Urbano

Sistema de gestión interna para clientes y presupuestos de Vivero Urbano.

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
- **Configuración** — presets de texto informativo reutilizables en presupuestos
- **Dashboard** — métricas del mes, actividad reciente, exportar CSV
- **Dark mode** — toggle persistido en localStorage, sin flash al recargar
- **Autenticación** — login con Supabase Auth, rutas protegidas por middleware

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

Aplicar el schema inicial:

```
Supabase → SQL Editor → pegar supabase/schema.sql → Run
```

Activar Row Level Security (después de crear el usuario):

```
Supabase → SQL Editor → pegar supabase/rls.sql → Run
```

Crear usuario del backoffice:

```
Supabase → Authentication → Users → Add user
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
