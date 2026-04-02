# Database Migration Plan

## Current state
- Local development uses SQLite via `apps/web/prisma/schema.prisma`.
- Admin CRUD APIs and audit logs are running on Prisma models.

## Target state
- Managed Postgres in production, SQLite local-only.

## Migration steps
1. Set production datasource to Postgres connection string.
2. Create first SQL migration from Prisma schema.
3. Apply migration in staging and run CRUD + authz smoke tests.
4. Validate indexes and query plans for catalog and releases.
5. Promote migration to production with rollback snapshot.

## Guardrails
- No destructive migrations without fallback path.
- Verify audit log writes for all admin mutation routes.
- Block deploy if migration or smoke tests fail.
