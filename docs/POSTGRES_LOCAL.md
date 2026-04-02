# Local PostgreSQL (optional)

SQLite remains the default for `apps/web` development. To exercise **PostgreSQL** locally before a hosted cutover:

1. Run Postgres — either **Compose** (persistent volume), **bundled dev stack** (Postgres + Redis), or a one-off container:

```bash
# From repo root (Postgres only)
docker compose -f docker-compose.postgres.yml up -d
```

```bash
# Postgres + Redis (see docs/RATE_LIMITS.md for REDIS_URL)
docker compose -f docker-compose.dev.yml up -d
```

```bash
# One-off (no named volume in repo)
docker run --name ssz-pg -e POSTGRES_PASSWORD=dev -e POSTGRES_USER=ssz -e POSTGRES_DB=savige -p 5433:5432 -d postgres:16
```

2. In `apps/web/prisma/schema.prisma`, set `provider = "postgresql"` and point `DATABASE_URL` at the instance, e.g.:

```bash
export DATABASE_URL="postgresql://ssz:dev@127.0.0.1:5433/savige?schema=public"
```

3. **Generate Postgres-native migrations** (do not reuse SQLite SQL files as-is). Typical flow: `prisma migrate dev` on a fresh DB after the provider flip, or use `prisma db push` only for experiments.

4. Run `pnpm exec prisma migrate deploy` and `pnpm exec prisma db seed`.

See `docs/POSTGRES_CUTOVER_CHECKLIST.md` and `docs/DB_MIGRATION_PLAN.md` for staging/production.
