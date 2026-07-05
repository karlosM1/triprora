# Crabi

Door-to-door van booking platform for travel between Aurora Province and Metro Manila, Philippines. Passengers search routes, pick seats, and manage bookings; drivers register, publish trips, and complete rides; admins review driver applications and oversee operations.

## Features

- **Passengers** — Search vans by route and date, select seats, complete checkout, and view or modify bookings
- **Drivers** — Multi-step registration with document uploads, trip creation and editing, and trip completion
- **Admins** — Dashboard stats, trip and booking management, user listing, and driver application review
- **Schedules** — Browse frequent routes and network monitoring views

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite, TanStack Router, TanStack Query, Tailwind CSS 4, shadcn/ui, Framer Motion |
| Backend | Express, Prisma, Zod |
| Database | PostgreSQL (Supabase or local Docker) |
| Auth | Supabase Auth (JWT verified by the API) |

## Project structure

```
crabi/
├── frontend/          # React SPA (Vite)
├── backend/           # Express API + Prisma schema
├── docker-compose.yml # Postgres + optional full stack
└── package.json       # npm workspaces root
```

## Prerequisites

- [Node.js](https://nodejs.org/) 22+
- [npm](https://www.npmjs.com/) 10+
- A [Supabase](https://supabase.com/) project (for authentication)
- PostgreSQL — either Supabase hosted or local via Docker

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env files and fill in your values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**Backend** (`backend/.env`):

| Variable | Description |
| --- | --- |
| `PORT` | API port (default `3001`) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public key (JWT verification) |
| `ADMIN_EMAIL` | Email that receives the `admin` role on sign-up |
| `DATABASE_URL` | Postgres connection string (transaction pooler, port 6543 for Supabase) |
| `DIRECT_URL` | Direct Postgres connection (migrations / `db push`, port 5432) |

**Frontend** (`frontend/.env`):

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | API base path (default `/api` — proxied to the backend in dev) |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |

> URL-encode special characters in database passwords (e.g. `@` → `%40`).

### 3. Set up the database

**Option A — Supabase (recommended)**

1. Create a Supabase project and copy the connection strings from **Project Settings → Database**.
2. Paste them into `backend/.env` as `DATABASE_URL` and `DIRECT_URL`.
3. Push the schema and seed default data:

```bash
npm run db:push
npm run db:seed
```

**Option B — Local Docker Postgres**

```bash
npm run db:up
```

Uncomment the local `DATABASE_URL` / `DIRECT_URL` lines in `backend/.env`, then:

```bash
npm run db:push:local
npm run db:seed
```

### 4. Supabase storage (driver registration)

Driver document uploads require a Supabase Storage bucket. Run the SQL in the Supabase SQL Editor:

```bash
npm run storage:setup -w backend
```

Or execute `backend/supabase/driver-documents-storage.sql` manually.

### 5. Run the app

Start both frontend and backend:

```bash
npm run dev
```

| Service | URL |
| --- | --- |
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001/api |
| Health check | http://localhost:3001/api/health |

Run services individually:

```bash
npm run dev:frontend   # Vite dev server
npm run dev:backend    # Express API with hot reload
```

The Vite dev server proxies `/api` requests to `http://localhost:3001` (override with `VITE_API_PROXY_TARGET`).

## Docker

Run the full stack (Postgres, backend, frontend):

```bash
npm run docker:up
```

Postgres only:

```bash
npm run db:up
```

Other commands:

```bash
npm run docker:down    # Stop containers
npm run docker:logs    # Follow container logs
```

When using Docker Compose, the backend container applies the schema and runs the seed on startup.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start frontend and backend concurrently |
| `npm run build` | Build all workspaces |
| `npm run typecheck` | Type-check all workspaces |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to the configured database |
| `npm run db:push:local` | Push schema to local Docker Postgres |
| `npm run db:migrate` | Run Prisma migrations (dev) |
| `npm run db:seed` | Seed default amenities (set `SEED_RESET=true` to wipe trips/bookings) |
| `npm run db:studio` | Open Prisma Studio |

## API overview

All routes are prefixed with `/api`.

| Route | Auth | Description |
| --- | --- | --- |
| `GET /health` | — | Health check |
| `/vans` | — | Search and list van trips |
| `/schedules` | — | Route schedules |
| `/bookings` | User | Create and manage bookings |
| `/me` | User | Profile and account |
| `/driver/*` | Driver / Passenger | Driver registration, trips |
| `/admin/*` | Admin | Stats, users, bookings, driver review |

Authentication uses Supabase JWTs sent as `Authorization: Bearer <token>`.

## User roles

| Role | Capabilities |
| --- | --- |
| `passenger` | Search, book, manage own bookings; submit driver application |
| `driver` | Create and manage trips; complete rides |
| `admin` | Full admin panel; review driver applications |

The account matching `ADMIN_EMAIL` in the backend env is assigned the `admin` role automatically on sign-up.

## License

Private — not licensed for public use.
