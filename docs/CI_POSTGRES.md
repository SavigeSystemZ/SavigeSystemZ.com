# Postgres in CI (future)

Today, `apps/web` ships with **SQLite** migrations under `prisma/migrations/` and CI runs `prisma migrate deploy` against `file:./dev.db`.

Those migration files are **SQLite-flavored** (e.g. `DATETIME`, quoting). They are **not** automatically portable to PostgreSQL until you:

1. Change `datasource db { provider = "postgresql" }` in `schema.prisma`.
2. Regenerate migrations for Postgres (or use `prisma db pull` / `migrate diff` in a controlled cutover), then validate on a real Postgres instance.

## Recommended path when hosting is ready

- Add a **staging** Postgres and run `prisma migrate deploy` there before production.
- Optionally add a GitHub Actions job with a `postgres` service container that:
  - Points `DATABASE_URL` at the service.
  - Uses a **Postgres-generated** migration history (after the provider flip), not the legacy SQLite SQL files.

Until migrations are Postgres-native, a CI job that only swaps `provider` and reuses current `migration.sql` files **will fail** — that is expected.

See also: `docs/DATABASE.md`, `docs/DB_MIGRATION_PLAN.md`, `infra/.env.staging.example`.
