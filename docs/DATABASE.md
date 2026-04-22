# Database (SavigeSystemZ `apps/web`)

## Stack

- **Development / CI:** **PostgreSQL** via `./scripts/dev-postgres.sh` (Docker on `localhost:5433`). Canonical `DATABASE_URL=postgresql://ssz:dev@localhost:5433/savige` — set in `apps/web/.env.local`. CI runs the same Postgres service container (see `.github/workflows/ci.yml` and `docs/CI_POSTGRES.md`).
- **Staging / production:** Managed **PostgreSQL** (RDS, Neon, Supabase, etc.). Set `DATABASE_URL` to your connection string with `sslmode=require` (or stricter) and run `pnpm exec prisma migrate deploy`. The Prisma `provider` is already `postgresql` — the SQLite → Postgres cutover landed in `e20a64c` (2026-04-07). Example env keys: `infra/.env.example` (generic) and `infra/.env.staging.example` (staging-oriented).

### Fallback: SQLite (not the supported path)

`./scripts/dev-sqlite.sh` remains available for quick local dev without Docker, but it is a **fallback only, not the supported path**. CI and production both run Postgres; new migrations are authored against Postgres and may not be portable back to SQLite. Prefer `./scripts/dev-postgres.sh` unless you explicitly need the escape hatch.

### Provisioning a new Postgres environment (short)

1. Provision a Postgres instance and create a role with least privilege for the app.
2. Copy `infra/.env.staging.example` into your secret store; set `DATABASE_URL` with `sslmode=require` (or stricter) for cloud hosts.
3. In `apps/web`, point `DATABASE_URL` at the new database and run `pnpm exec prisma migrate deploy` (plus `pnpm exec prisma db seed` if you want catalog fixtures).
4. Run smoke tests (owner login, catalog, checkout mock path) before promoting schema changes to production.

For **GitHub Actions + Postgres**, see `docs/CI_POSTGRES.md`.

**Vault encryption:** `VAULT_ENCRYPTION_KEY`, optional **`VAULT_ENCRYPTION_KEY_LEGACY`**, S3 hybrid uploads, and quotas are documented in `docs/VAULT.md`. Key rotation: `docs/VAULT_KEY_ROTATION.md`. S3 operations: `docs/S3_VAULT_HARDENING.md`. Local Postgres experiment: `docs/POSTGRES_LOCAL.md`. Postgres cutover checklist: `docs/POSTGRES_CUTOVER_CHECKLIST.md`.

## Migrations (required)

Do **not** rely on `prisma db push` for production. Use versioned SQL:

```bash
cd apps/web
pnpm exec prisma migrate deploy
pnpm exec prisma generate
```

To create new migrations in development (from a TTY):

```bash
pnpm exec prisma migrate dev --name describe_change
```

## Seed (catalog baseline)

Optional demo data (public applications + one version) for local/staging:

```bash
cd apps/web
pnpm exec prisma db seed
```

Safe to re-run: uses `upsert` on `slug` and `applicationId` + `version`.

## Hardening checklist

- **Least privilege:** DB user should only have DML/DDL needed (no superuser in app role).
- **TLS:** Use `sslmode=require` (or stricter) in production Postgres URLs.
- **Secrets:** Never commit `.env`, `*.db`, or connection strings.
- **Backups:** Automated snapshots for production Postgres.
- **Indexes:** Schema includes indexes for sessions, audit logs, catalog queries, purchases, downloads, and project requests.

## Prisma client

`apps/web/lib/db.ts` logs `error`/`warn` in all environments; set `PRISMA_LOG_QUERIES=1` in development only to enable query logging.
