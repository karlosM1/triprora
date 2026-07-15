# Crabr

Door-to-door van booking platform for travel between Aurora Province and Metro Manila, Philippines. Passengers search routes, pick seats, and pay online or in cash; drivers register, publish trips, and manage earnings; admins review applications and oversee wallets and operations.

> Monorepo package name: `triprora` (npm workspaces). Product brand: **Crabr**.

## Features

- **Passengers:** Search vans by route and date, select seats, checkout with QR Ph or cash, manage bookings, and save destination addresses
- **Drivers:** Multi-step registration with document uploads, trip creation and editing, trip completion, and wallet balance with payouts
- **Admins:** Dashboard stats, trip and booking management, user listing, driver application review, and wallet / settlement / payout oversight
- **Payments:** PayMongo QR Ph for cashless checkout; cash bookings with platform commission tracking
- **Schedules:** Browse frequent routes and network monitoring views
- **Account:** Profile management, privacy policy, and terms of service

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite, TanStack Router, TanStack Query, Tailwind CSS 4, shadcn/ui, Framer Motion |
| Backend | Express, Prisma, Zod |
| Database | PostgreSQL (Supabase or local Docker) |
| Auth | Supabase Auth (JWT verified by the API) |
| Payments | PayMongo (QR Ph) |
| Storage | Supabase Storage (driver documents) |

## Project structure

```
triprora/
├── frontend/          # React SPA (Vite)
├── backend/           # Express API + Prisma schema
├── docker-compose.yml # Postgres + optional full stack
└── package.json       # npm workspaces root
```

## Prerequisites

- [Node.js](https://nodejs.org/) 22+
- [npm](https://www.npmjs.com/) 10+
- A [Supabase](https://supabase.com/) project (for authentication and storage)
- A [PayMongo](https://www.paymongo.com/) account (for QR Ph payments)
- PostgreSQL, either Supabase hosted or local via Docker

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
| `PAYMONGO_SECRET_KEY` | PayMongo secret key (`sk_test_...` or `sk_live_...`) |

**Frontend** (`frontend/.env`):

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | API base path (default `/api`, proxied to the backend in dev) |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |

> URL-encode special characters in database passwords (e.g. `@` → `%40`).

### 3. Set up the database

**Option A: Supabase (recommended)**

1. Create a Supabase project and copy the connection strings from **Project Settings → Database**.
2. Paste them into `backend/.env` as `DATABASE_URL` and `DIRECT_URL`.
3. Push the schema and seed default data:

```bash
npm run db:push
npm run db:seed
```

**Option B: Local Docker Postgres**

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

Compose runs a local **development** stack (Postgres, Express with `tsx watch`, Vite with HMR). Source under `backend/src`, `backend/prisma`, and `frontend/src` is bind-mounted so edits hot-reload inside the containers.

Copy env files first (`backend/.env`, `frontend/.env`). Supabase Auth and PayMongo keys are still required. Compose overrides `DATABASE_URL` / `DIRECT_URL` to the in-compose Postgres service.

Run the full stack:

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

On backend startup the container regenerates the Prisma client and runs `db push`. Set `SEED_RESET=true` in `backend/.env` to also run the seed. Frontend waits until the API health check passes before starting.
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
| `GET /health` | None | Health check |
| `/vans` | None | Search and list van trips |
| `/schedules` | None | Route schedules and frequent routes |
| `/bookings` | User | Create and manage bookings |
| `/payments` | User | QR Ph payment intents and status |
| `/me` | User | Profile, account, and destination addresses |
| `/driver/*` | Driver / Passenger | Registration, trips, and wallet |
| `/admin/*` | Admin | Stats, users, bookings, drivers, wallets, settlements, payouts |

Authentication uses Supabase JWTs sent as `Authorization: Bearer <token>`.

## User roles

| Role | Capabilities |
| --- | --- |
| `passenger` | Search, book (QR Ph or cash), manage bookings and destinations; submit driver application |
| `driver` | Create and manage trips; complete rides; view wallet and request payouts |
| `admin` | Full admin panel; review driver applications; settle wallets and approve payouts |

The account matching `ADMIN_EMAIL` in the backend env is assigned the `admin` role automatically on sign-up.

## License

Private, not licensed for public use.
