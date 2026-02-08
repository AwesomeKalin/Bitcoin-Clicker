# Bitcoin-Clicker Monorepo

This repository is scaffolded as a Bun workspace monorepo with two packages:

- `webapp` — React (Vite) client-side app; intended to use Convex as the backend service.
- `historical-api` — Express API using Prisma + PostgreSQL for historical price storage.

Quick start (requires Bun installed):

1. Install dependencies at repo root:

```bash
bun install
```

2. Run the webapp (in one terminal):

```bash
bun workspace run webapp dev
```

3. Run the API (in another terminal):

```bash
cd historical-api
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/mydb" bun run dev
```

Notes:
- Configure Convex for `webapp` separately (Convex requires its own project / CLI setup).
- Update `historical-api/.env.example` to provide a real `DATABASE_URL` before running Prisma commands.
# Bitcoin-Clicker
A clicker game running on BSV
