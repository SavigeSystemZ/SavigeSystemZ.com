# Postgres in CI

CI (`.github/workflows/ci.yml`) runs against a **PostgreSQL service container** — both the quality job (`lint + typecheck + unit + build`) and the Playwright E2E job. The Prisma `provider` is `postgresql`; migrations under `apps/web/prisma/migrations/` are Postgres-native.

**Cutover landed:** 2026-04-07 in commit `e20a64c` (feat: PostgreSQL cutover, S3 vault scan Lambda, CI with Postgres service).

## How the CI jobs are wired

- A `postgres` service container (port 5432 on the Actions runner) is started per job.
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/savige` is injected into each step.
- `pnpm exec prisma migrate deploy` runs migrations before tests.
- Playwright spins its own dev server against the same `DATABASE_URL`.

See `.github/workflows/ci.yml` for the authoritative job config.

## Local parity

- `./scripts/dev-postgres.sh` — provisions a Docker Postgres on `localhost:5433`, runs migrations + seed, mirrors CI behavior closely.
- `./scripts/dev-sqlite.sh` — fallback only, **not the supported path**. Keep using Postgres locally when possible to avoid migration drift.

## Adding a new migration

1. Edit `apps/web/prisma/schema.prisma`.
2. `cd apps/web && pnpm exec prisma migrate dev --name <short_description>` against your local Postgres.
3. Commit the new `apps/web/prisma/migrations/<timestamp>_<name>/migration.sql`.
4. Restart the dev server (module cache holds the stale Prisma client) — see `docs/DEV_ENV_GOTCHAS.md`.

## Staging / production

- Provision managed Postgres (RDS, Neon, Supabase).
- Set `DATABASE_URL` with `sslmode=require` (or stricter).
- Run `pnpm exec prisma migrate deploy`.

See also: `docs/DATABASE.md`, `docs/POSTGRES_CUTOVER_CHECKLIST.md`, `docs/DEV_ENV_GOTCHAS.md`, `infra/.env.staging.example`.
