# Execution Plan

## Current phase

**M9 — Hardening and launch** (wrapping) and **M10 — Code module** (scaffold landed 2026-04-22; tests + polish outstanding).

Milestones M0–M8 are complete. M9 remaining work is external-blocked (S3 creds, Stripe keys, DNS). M10 introduces the "store code like GitHub & connect to GitHub" surface — Prisma model, GitHub metadata sync, owner-only admin UI. M11 (self-hosted git storage backend) is scoped but not started.

## Active work items (from TODO.md)

1. Apply `0002_code_repository` migration against Postgres and round-trip the admin /code panel
2. Add unit + E2E coverage for the Code module
3. Close out M9 external-blocked items (S3, Stripe live, DNS) as credentials arrive
4. Begin M11 scoping — decide git storage backend (Gitea sidecar vs. S3-mirrored refs)

## Constraints

- **Security first** — no regressions on auth, validation, audit logging
- **Migration discipline** — `prisma migrate` only; no `db push` for shared changes
- **No SQLite SQL for Postgres** — regenerate migrations when provider flips
- **No header-based auth trust** — session cookie + DB always
- **`pnpm check:all` green** — after every substantive change
- **Milestone isolation** — finish P0 before starting P1 items

## Blocked items

| Item | Blocked by |
|------|-----------|
| S3 upload verification | Real AWS bucket credentials not configured |
| Postgres cutover | P0 items should stabilize first |
| Domain verification | Need Vercel project attachment |
| CI/CD pipeline | Need git remote first |

## Decision log

- SQLite for dev, Postgres for prod — avoids Docker requirement for contributors
- `proxy.ts` over `middleware.ts` — Next.js 16 architecture
- Session cookies over JWTs — simpler, revocable, DB-backed
- Guided launch composers — reduce error-prone manual multi-step publishing
- Mock commerce in dev — real Stripe only in staging/production
- **Canonical dev port 43907** (2026-04-22) — prevents collision with local Immortality app on port 3000 and gives the desktop launcher a stable target. `SITE_PORT` env overrides.
- **Code module ships as GitHub mirror first** (M10, 2026-04-22) — DB-backed metadata cache + admin sync. Self-hosted git storage deferred to M11 to keep the admin UX and data model stable before we add a real object store / git daemon.
