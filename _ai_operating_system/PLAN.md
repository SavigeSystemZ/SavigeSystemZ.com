# Execution Plan

## Current phase

**M7.6 finish + M9 landing.** As of 2026-04-27 the M7 dashboard intelligence slices 1–5 are shipped and **slice 6 (operator alert ergonomics) is mid-flight** — schema (`DashboardAlert` + migration `0005`) and acknowledge API are landed; the spike-notice component and `lib/admin-dashboard.ts` wiring are blocked on a filesystem-ownership unblock (`sudo chown -R whyte:whyte`). M9 (production launch readiness) gained an admin gate page (`/admin/launch`) backed by `evaluateProductionLaunchReadiness()`. M10 (code module) is feature-complete except for a public `/repos` index. M11 has its schema stub (`CodeRepositoryStorageBackend` enum) so the eventual self-hosted backend will not require a churning migration.

Milestones M0–M8 complete. M9 remaining work is external-blocked (S3 creds, Stripe live, Vercel DNS attach). M11 is scoped, schema-stubbed, otherwise unstarted.

## Active work items (from TODO.md)

1. **Unblock filesystem ownership** — `sudo chown -R whyte:whyte /home/whyte/.MyAppZ/SavigeSystemZ.com`, then `./scripts/post-chown-verify.sh`. This is gating: `pnpm dev:web` cannot read 321 root-owned files (incl. `packages/ui/src/Panel.tsx`, `lib/admin-dashboard.ts`, `app/(public)/repos/`, `.git/index`) until it runs.
2. **Land the uncommitted batch** — run `./scripts/post-chown-commit.sh` for 7 themed commits (rules, P0 fixes, M9 page, M7.6 schema/API, polish, packaged launcher, AI OS updates).
3. **Apply pending Prisma migrations** — `0004_purchase_email_index_and_stripe_event_dedupe`, `0005_dashboard_alert_and_code_storage_backend`.
4. **Finish M7.6** — wire `DashboardAlert` into `lib/admin-dashboard.ts`, build `components/admin/dashboard-spike.tsx` against the acknowledge route.
5. **M10 polish** — public `app/(public)/repos/page.tsx` index + per-repo audit feed in admin.
6. **Triage P1 review items** — refund flow, AI per-user rate limit + audit, License/Purchase transaction wrap, README markdown sanitizer fixtures, Application JSON-blob typing.
7. **Close M9 external blockers** as credentials arrive (S3, Stripe live, DNS).
8. **Begin M11 backend decision** — Gitea sidecar vs. `isomorphic-git`/S3 bare-repo. Capture in `docs/CODE_STORAGE.md`.

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
