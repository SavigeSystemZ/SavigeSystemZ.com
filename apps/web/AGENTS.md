# AGENTS — `apps/web`

<!-- Next.js upstream notice (keep short): breaking changes vs older majors — see Next 16 docs. -->

## Stack

- **Next.js 16** (App Router, Turbopack dev). Entry: `app/`. Network edge: **`proxy.ts`** (not `middleware.ts`).
- **Prisma** + PostgreSQL (`prisma/schema.prisma`, `prisma/migrations/`). Local dev: **`DATABASE_URL=postgresql://ssz:dev@localhost:5433/savige`** — `./scripts/dev-postgres.sh` starts Docker Postgres and seeds, or set it in `apps/web/.env.local`.
- **Auth:** `lib/auth.ts` — cookie `sz_session` + `Session` table. **`getAuthContext` / `requireOwner`** for admin APIs.
- **Catalog:** `lib/catalog-resolver.ts` for public pages; static fallback `lib/catalog.ts`.

## Public catalog API

- **`GET /api/catalog`** — JSON list of `PUBLIC` applications (`id`, `slug`, `name`, …) for storefronts and tests. No auth.

## Local dev URL

- Canonical port **43907**. `pnpm dev:web` prefers it; override with `SITE_PORT=<port> pnpm dev:web`. See root `CLAUDE.md` → _Local dev URL and desktop launcher_.

## Code module (M10)

- Admin UI at **`/admin/code`** (gated by `requireOwner()`). Model: `CodeRepository` + enums. Sync via `lib/github-client.ts` + `lib/code-repository.ts`.
- APIs: `GET/POST /api/admin/code`, `PATCH /api/admin/code/[id]` (link apps), `POST /api/admin/code/[id]` (sync), `DELETE /api/admin/code/[id]` (untrack).
- `Application.codeRepositoryId` (optional FK, `onDelete: SetNull`) — a repo can power multiple apps; when PUBLIC, its metadata surfaces on `/applications/[slug]`.
- Env: `GITHUB_TOKEN` optional — required only for private repos or to raise the 60 req/hr anonymous GitHub rate limit. Bulk bootstrap: `pnpm code:bootstrap` (sync org repos → seed apps → seed releases/media).

## Catalog integrity + staging probes

- **`pnpm code:verify-catalog`** — asserts 52 org repos → public apps → media → v0.1.0 releases (`lib/verify-catalog-completeness.ts`). Use `GITHUB_MOCK_MODE=1` in CI.
- **`pnpm staging:verify`** — env checklist for Stripe + S3 presign; add **`-- --probe-http --probe-presign`** to hit live `/api/health` and owner presign routes (`lib/staging-probes.ts`).
- Screenshot tiers: cached PNG (`public/showcase/screenshots/`), manual override (`public/showcase/manual/{slug}/`), GitHub Open Graph fallback (`lib/catalog-showcase-media.ts`).
- Admin lane: **`POST /api/admin/application-media/[id]/set-catalog-screenshot`** promotes uploaded media to the catalog screenshot URL.

## E2E notes

- Canonical reuse: **`E2E_PORT=43907 pnpm test:e2e`** when `pnpm dev:web` is already on 43907 (Playwright loads owner secrets from `.env.local`).
- CI-style fresh server: stop the local dev server first, then **`CI=1 E2E_PORT=3456 OWNER_ACCESS_CODE=e2e-owner-code OWNER_LOGIN_SECRET=e2e-owner-secret-change-me-32chars pnpm test:e2e`** — Next.js 16 blocks a second `next dev` in the same app directory while one is running.

## Files to touch for common tasks

| Task | Primary paths |
|------|----------------|
| New API route | `app/api/.../route.ts`, `lib/validation.ts` |
| Admin UI | `app/(admin)/admin/`, `components/admin/` |
| Security headers / admin HTML gate | `proxy.ts`, `packages/security/src/index.ts` |
| DB schema | `prisma/schema.prisma` then `prisma migrate` |
| E2E | `tests/e2e/`, `playwright.config.ts` |
| Code / GitHub | `lib/github-client.ts`, `lib/code-repository.ts`, `app/(admin)/admin/code/`, `app/api/admin/code/` |

## Handoff

Resume work: repo root **`_ai_operating_system/SESSION_RECALL.md`** (full checklist), **`WHERE_LEFT_OFF.md`** (short status).

## Vault rate limits

- **`vaultMutationGate(request)`** in `lib/vault-rate-limit.ts` — returns `NextResponse` (**429** / **503**) or `null`.
- Optional **`REDIS_URL`**, optional **`VAULT_REDIS_STRICT=1`** — see `docs/RATE_LIMITS.md`.

## Checklist before PR

- [ ] `pnpm exec eslint .` in `apps/web` (or root `pnpm lint`)
- [ ] `pnpm exec tsc --noEmit`
- [ ] `pnpm test` (Vitest)
- [ ] For auth/DB flows: `pnpm test:e2e` with `DATABASE_URL=postgresql://ssz:dev@localhost:5433/savige` and owner secrets
