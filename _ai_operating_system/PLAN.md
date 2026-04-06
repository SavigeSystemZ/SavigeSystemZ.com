# Execution Plan

## Current phase

**M9 — Hardening and launch** (in progress)

Milestones M0-M8 are complete. The public site, admin platform, creator pipeline, archive system, commerce, and vault are all built and passing quality gates. Now finishing the launch story and production hardening.

## Active work items (from TODO.md P0)

1. Archive launch composer — guided flow matching the application launch composer
2. Creator-to-launch handoff — streamline post-promotion navigation
3. Real S3 bucket wiring — configure credentials, verify upload UI
4. Git remote + push — establish origin and push local commits

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
