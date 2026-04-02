# Database Migration Plan

## Current state
- Local development and CI use **SQLite** with **versioned migrations** under `apps/web/prisma/migrations/` (`prisma migrate deploy`).
- Admin CRUD APIs, audit logs, and public catalog reads are backed by Prisma models.

## Target state
- Managed Postgres in production; SQLite remains optional for local-only workflows.

## Migration steps
1. Set production datasource to `postgresql` in `schema.prisma` and point `DATABASE_URL` at Postgres.
2. Run `prisma migrate deploy` (after validating SQL compatibility; SQLite and Postgres differ slightly—test on staging).
3. Apply migration in staging and run CRUD + authz smoke tests.
4. Validate indexes and query plans for catalog and releases.
5. Promote migration to production with rollback snapshot.

## Staging environment

- **Env template:** `infra/.env.staging.example` lists typical staging variables (Postgres URL, Stripe test keys, WebAuthn origins).
- **Provider switch:** Prisma allows only one `provider` per `schema.prisma`. Teams usually maintain **SQLite for local** on `main` and use a **branch or deploy step** that sets `provider = "postgresql"` before CI/CD deploys to staging/production, or use separate repos/remotes—pick one workflow and document it for your team.
- **Data:** Run `prisma db seed` on staging after first deploy if you need the public catalog fixtures for QA.

## Guardrails
- No destructive migrations without fallback path.
- Verify audit log writes for all admin mutation routes.
- Block deploy if migration or smoke tests fail.
