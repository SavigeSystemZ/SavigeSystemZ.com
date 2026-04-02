# Postgres cutover checklist

Use this when moving from **SQLite** (local/CI) to **PostgreSQL** (staging/production).

## Preconditions

- [ ] Managed Postgres instance (TLS, backups, least-privilege role).
- [ ] `DATABASE_URL` with `sslmode=require` (or stricter) for cloud hosts.
- [ ] `OWNER_LOGIN_SECRET`, `VAULT_ENCRYPTION_KEY`, Stripe, and download signing secrets in a secrets manager.

## Schema

- [ ] Set `datasource db { provider = "postgresql" }` in `apps/web/prisma/schema.prisma`.
- [ ] **Do not** run SQLite `migration.sql` files against Postgres as-is — generate **Postgres-native** migrations (baseline or `prisma migrate diff`) after the provider flip.
- [ ] Run `pnpm exec prisma migrate deploy` against an empty staging database; fix SQL dialect issues as needed.

## Data

- [ ] If migrating existing SQLite data, plan ETL (export/import) or accept fresh start for staging.
- [ ] Run `pnpm exec prisma db seed` on staging if catalog fixtures are required.

## Verification

- [ ] Owner login, session cookie, admin CRUD.
- [ ] Catalog and public pages.
- [ ] Checkout mock path; Stripe test webhook if configured.
- [ ] Vault encrypt/decrypt round-trip with `VAULT_ENCRYPTION_KEY`.
- [ ] `pnpm check:all` and Playwright E2E against staging URL (or local Postgres).

## Rollback

- [ ] Snapshot before migration; document restore steps.
- [ ] Keep app release reversible (previous image + DB snapshot).

See also: `docs/DATABASE.md`, `docs/DB_MIGRATION_PLAN.md`, `docs/CI_POSTGRES.md`.
