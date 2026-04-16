# 🌿 Backoffice · Vivero Urbano

Sistema de gestión interna (CRM) para clientes y presupuestos del Vivero Urbano.

---

## Stack tecnológico

| Capa | Tecnología | Hosting gratuito |
|------|-----------|-----------------|
| Frontend | Next.js 14 · TypeScript · Tailwind CSS | Vercel |
| Backend | Spring Boot 3.3 · Java 21 | Render / Railway (futuro) |
| Base de datos | PostgreSQL via Supabase | Supabase (free tier) |
| CI/CD | GitHub Actions | GitHub (free) |

---

## Estructura del proyecto

```
backoffice-vivero-urbano/
├── frontend/                  # Aplicación Next.js (App Router)
│   ├── src/
│   │   ├── app/               # Páginas y layouts (Next.js App Router)
│   │   │   └── (backoffice)/  # Layout con sidebar
│   │   │       ├── dashboard/ # Métricas generales
│   │   │       ├── clients/   # Gestión de clientes
│   │   │       ├── quotes/    # Gestión de presupuestos
│   │   │       └── settings/  # Presets de texto
│   │   ├── components/        # Componentes reutilizables
│   │   ├── lib/               # Lógica de acceso a datos (Supabase)
│   │   ├── types/             # Tipos TypeScript del dominio
│   │   └── hooks/             # Custom hooks de React
│   └── .env.local             # Variables de entorno (NO subir a git)
│
├── backend/                   # API REST con Spring Boot
│   └── src/main/java/com/viverourbano/backoffice/
│       ├── domain/            # Modelos de negocio e interfaces de repositorio
│       ├── application/       # Casos de uso, DTOs y mappers
│       └── infrastructure/    # Controladores REST, JPA, configuración
│
├── .github/workflows/         # CI/CD con GitHub Actions
├── docker-compose.yml         # PostgreSQL local para desarrollo
└── setup-repo.ps1             # Script de inicialización (correr una sola vez)
```

---

## Ramas

| Rama | Propósito | Deploy |
|------|-----------|--------|
| `dev` | Desarrollo activo | Solo CI |
| `test` | Staging / QA | Vercel preview |
| `main` | Producción | Vercel producción |

**Flujo de trabajo:**
```
feature → dev → test (QA) → main (prod)
```

---

## Primeros pasos

### 1. Clonar el repo

```bash
git clone https://github.com/carlosaurelio94/backoffice-vivero-urbano.git
cd backoffice-vivero-urbano
```

### 2. Configurar variables de entorno del frontend

```bash
cd frontend
cp .env.local.example .env.local
# Editá .env.local con tus credenciales de Supabase
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://dktdmcvglmjmacgynqci.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

> Encontrás la anon key en: [Supabase Dashboard → Settings → API Keys](https://supabase.com/dashboard/project/dktdmcvglmjmacgynqci/settings/api-keys/legacy)

### 3. Correr el frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### 5. Correr el backend (cuando esté listo)

```bash
cd backend
./mvnw spring-boot:run
# → http://localhost:8080
# → Swagger UI: http://localhost:8080/swagger-ui.html
```

---

## Deploy en producción (gratuito)

### Frontend → Vercel

1. Ir a [vercel.com](https://vercel.com) → New Project → Import `backoffice-vivero-urbano`
2. Configurar el **Root Directory** como `frontend`
3. Agregar las variables de entorno en Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Cada push a `main` deploya automáticamente via GitHub Actions

### Base de datos → Supabase

Ya configurada en [supabase.com](https://supabase.com) — proyecto `vivero_urbano`.

### Backend → Render (próximamente)

El backend Java se desplegará en [render.com](https://render.com) (free tier) cuando esté completo.

---

## GitHub Actions — Secrets requeridos

Configurar en **GitHub → Settings → Secrets and variables → Actions**:

| Secret | Descripción |
|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase (pública) |
| `VERCEL_TOKEN` | Token de Vercel (Account Settings → Tokens) |
| `VERCEL_ORG_ID` | ID de organización de Vercel |
| `VERCEL_PROJECT_ID` | ID del proyecto en Vercel |

---

## Tablas en Supabase

| Tabla | Descripción |
|-------|-------------|
| `clients` | Clientes y prospectos |
| `quotes` | Presupuestos (cabecera) |
| `quote_items` | Líneas de detalle de cada presupuesto |
| `quote_information` | Presets de texto informativo del pie del PDF |

---

## Tecnologías del frontend

- **Next.js 14** con App Router — framework de React para producción
- **TypeScript** (strict) — tipado estático
- **Tailwind CSS** — estilos utility-first
- **TanStack Query** — manejo de estado del servidor (cache, loading, errores)
- **Zustand** — estado de UI global
- **React Hook Form + Zod** — formularios con validación tipada
- **Supabase JS** — cliente para la base de datos
- **Lucide React** — íconos

## Tecnologías del backend

- **Spring Boot 3.3** · **Java 21**
- **Clean Architecture** — domain / application / infrastructure
- **Spring Data JPA** — persistencia con Hibernate
- **MapStruct** — mapeo automático entidad ↔ DTO
- **Lombok** — reducción de boilerplate
- **OpenAPI 3** — documentación automática de la API
- **Bean Validation** — validación de requests

---

*Desarrollado para Vivero Urbano · Jardines y Paisajismo*
