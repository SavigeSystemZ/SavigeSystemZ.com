# AGENTS — `apps/web`

<!-- Next.js upstream notice (keep short): breaking changes vs older majors — see Next 16 docs. -->

## Stack

- **Next.js 16** (App Router, Turbopack dev). Entry: `app/`. Network edge: **`proxy.ts`** (not `middleware.ts`).
- **Prisma** + SQLite locally (`prisma/schema.prisma`, `prisma/migrations/`). **`DATABASE_URL=file:./dev.db`** → `prisma/dev.db`.
- **Auth:** `lib/auth.ts` — cookie `sz_session` + `Session` table. **`getAuthContext` / `requireOwner`** for admin APIs.
- **Catalog:** `lib/catalog-resolver.ts` for public pages; static fallback `lib/catalog.ts`.

## Public catalog API

- **`GET /api/catalog`** — JSON list of `PUBLIC` applications (`id`, `slug`, `name`, …) for storefronts and tests. No auth.

## Files to touch for common tasks

| Task | Primary paths |
|------|----------------|
| New API route | `app/api/.../route.ts`, `lib/validation.ts` |
| Admin UI | `app/(admin)/admin/`, `components/admin/` |
| Security headers / admin HTML gate | `proxy.ts`, `packages/security/src/index.ts` |
| DB schema | `prisma/schema.prisma` then `prisma migrate` |
| E2E | `tests/e2e/`, `playwright.config.ts` |

## Handoff

Resume work: repo root **`_ai_operating_system/SESSION_RECALL.md`** (full checklist), **`WHERE_LEFT_OFF.md`** (short status).

## Vault rate limits

- **`vaultMutationGate(request)`** in `lib/vault-rate-limit.ts` — returns `NextResponse` (**429** / **503**) or `null`.
- Optional **`REDIS_URL`**, optional **`VAULT_REDIS_STRICT=1`** — see `docs/RATE_LIMITS.md`.

## Checklist before PR

- [ ] `pnpm exec eslint .` in `apps/web` (or root `pnpm lint`)
- [ ] `pnpm exec tsc --noEmit`
- [ ] `pnpm test` (Vitest)
- [ ] For auth/DB flows: `pnpm test:e2e` with `DATABASE_URL=file:./dev.db` and owner secrets
