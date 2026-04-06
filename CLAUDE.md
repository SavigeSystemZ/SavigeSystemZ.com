# CLAUDE.md — SavigeSystemZ.com

Root instruction file for all AI agents (Claude Code, Cursor, Copilot, etc.) working on this monorepo. Every agent should read this first.

## Project

**SavigeSystemZ.com** — flagship software foundry platform. Next.js 16 monorepo for showcasing, distributing, and selling applications.

## Monorepo layout

```
apps/web/            → Next.js 16 App Router (the website)
packages/            → shared libs: ai, config, domain, security, ui
modules/             → domain module contracts (admin, ai, auth, catalog, creator-submissions, payments, project-requests, releases, reviews, vault)
services/workers/    → background pipeline shell
scripts/             → dev-web.mjs, build-web.mjs, full-cycle.sh
infra/               → Docker compose files, S3 Lambda starters, env templates
docs/                → architecture, security, database, runbook, launch docs
_ai_operating_system/ → planning, handoff, prompt packs, risk, TODO (AI agent layer)
installer/           → optional desktop launcher and packaging assets
```

## Before you start working

1. Read `_ai_operating_system/WHERE_LEFT_OFF.md` — latest session state
2. Read `_ai_operating_system/SESSION_RECALL.md` — full done/not-done checklist
3. Read `_ai_operating_system/TODO.md` — prioritized action items

See also: `apps/web/AGENTS.md` (web-app specifics), `AGENTS.md` (repo-wide agent entrypoint), `CONTRIBUTING.md` (PR guidelines).

## AI system file map

| File | Purpose |
|------|---------|
| **This file** (`CLAUDE.md` at root) | Root instructions for all AI agents |
| `apps/web/CLAUDE.md` | Web-app quick reference (routes to `AGENTS.md`) |
| `AGENTS.md` | Repo-wide agent entrypoint — rules locations, non-negotiables |
| `apps/web/AGENTS.md` | Web app stack, file map, vault rate limits, PR checklist |
| `.cursor/rules/ssz-*.mdc` | Cursor project rules (monorepo, web, prisma, security) |
| `.cursor/apps/savigesystemz/APP_PACK.md` | Cursor rule pack manifest |
| `_ai_operating_system/` | Full AI planning layer (see `_ai_operating_system/README.md`) |

**Claude Code users:** Project-level instructions are also at `~/.claude/projects/.../CLAUDE.md`; persistent memory is at `~/.claude/projects/.../memory/`.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack dev) |
| Language | TypeScript 5.x, React 19 |
| Styling | Tailwind CSS 4 |
| Database | Prisma ORM, SQLite (dev), PostgreSQL (prod target) |
| Auth | Session cookies + DB (`lib/auth.ts`), WebAuthn/passkeys |
| Commerce | Stripe (checkout, webhooks, signed downloads) |
| Storage | S3 (release assets, media, vault) |
| Cache/Limits | Redis (optional, for rate limiting) |
| Testing | Vitest (unit), Playwright (E2E), axe (a11y) |
| Monorepo | pnpm 10 + Turborepo |

## Commands

```bash
pnpm install                    # install all deps
pnpm dev:web                    # dev server (auto-selects port, prints URL)
pnpm build:web                  # production build
pnpm check:all                  # lint + typecheck + test + build (run before PR)
pnpm --filter web lint          # ESLint for web app
pnpm --filter web typecheck     # TypeScript check
pnpm --filter web test          # Vitest unit tests
pnpm --filter web test:e2e      # Playwright E2E (needs DATABASE_URL + owner secrets)
```

## Non-negotiable rules

1. **No trust of client `x-user-*` headers** — auth is session cookie + DB only (`getAuthContext()` / `requireOwner()`).
2. **Migrations over db push** — use `prisma migrate` for anything beyond throwaway local experiments.
3. **`pnpm check:all` green** before merging substantive changes.
4. **Secrets never committed** — `.env.example` stays example-only; never commit `.env*`, `*.db`, or real keys.
5. **proxy.ts not middleware.ts** — Next.js 16 uses `proxy.ts` for network edge logic. Do not create `middleware.ts`.
6. **Web Crypto only** — use `lib/hmac-web.ts`, not `node:crypto`, for Edge compatibility.
7. **Zod validation** — API bodies validated via `lib/validation.ts`; return `400` with `issues` on failure.
8. **Audit mutations** — important mutations call `writeAuditLog` from `lib/audit.ts`.
9. **`force-dynamic` for Prisma pages** — use `export const dynamic = "force-dynamic"` when Prisma must not run at build time without `DATABASE_URL`.

## Key file locations (apps/web)

| Purpose | Path |
|---------|------|
| Network edge (headers, admin HTML gate) | `proxy.ts` |
| Auth (session + DB) | `lib/auth.ts` |
| Database client | `lib/db.ts` |
| API validation | `lib/validation.ts` |
| Audit logging | `lib/audit.ts` |
| Catalog resolver | `lib/catalog-resolver.ts` |
| Rate limiting | `lib/rate-limit.ts`, `lib/vault-rate-limit.ts` |
| Stripe | `lib/stripe-client.ts`, `lib/stripe-webhook-processor.ts` |
| Vault crypto | `lib/vault-crypto.ts`, `lib/vault-payload.ts` |
| S3 presign | `lib/s3-presign.ts`, `lib/s3-release-presign.ts`, `lib/s3-application-media-presign.ts` |
| Signed downloads | `lib/signed-download.ts`, `lib/entitlements.ts` |
| Launch readiness | `lib/launch-readiness.ts` |
| Creator promotion | `lib/creator-promotion.ts` |
| DB schema | `prisma/schema.prisma` |
| Public routes | `app/(public)/` |
| Admin routes | `app/(admin)/admin/` |
| API routes | `app/api/` |
| Unit tests | `tests/unit/` |
| E2E tests | `tests/e2e/` |

## Route groups

- `(public)` — home, applications, archive, bio, downloads, pricing, reviews, services
- `(admin)` — owner dashboard, app/release/archive/media managers, moderation, audit
- `(auth)` — owner login
- `api/` — catalog, checkout, webhooks, download, admin APIs, vault, health

## Environment setup (local dev)

```bash
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local: set DATABASE_URL=file:./dev.db, OWNER_ACCESS_CODE, OWNER_LOGIN_SECRET
cd apps/web && pnpm exec prisma generate && pnpm exec prisma migrate deploy && pnpm exec prisma db seed && cd ../..
pnpm dev:web
```

## Documentation index

| Doc | Topic |
|-----|-------|
| `docs/DATABASE.md` | Migrations, seed, Postgres path |
| `docs/SECURITY_HARDENING.md` | Threat model and enforced controls |
| `docs/SECURITY_MODEL.md` | Security architecture |
| `docs/RATE_LIMITS.md` | Redis rate limiting |
| `docs/VAULT.md` | Vault encryption details |
| `docs/VAULT_KEY_ROTATION.md` | Key rotation procedure |
| `docs/STRIPE_WEBHOOK_TESTING.md` | Stripe testing guide |
| `docs/POSTGRES_CUTOVER_CHECKLIST.md` | Migration to PostgreSQL |
| `docs/LAUNCH_CHECKLIST.md` | Production launch items |
| `docs/PRODUCTION_DOMAIN_VERIFICATION.md` | Domain routing verification |
| `docs/DATA_MODEL.md` | Entity relationships |
| `docs/ARCHITECTURE.md` | System architecture |
| `docs/NFR.md` | Non-functional requirements |
| `docs/RUNBOOK.md` | Operations runbook |

## Handoff system

Always update these files when stopping work:
- `_ai_operating_system/WHERE_LEFT_OFF.md` — short pulse (timestamp, status, next steps)
- `_ai_operating_system/SESSION_RECALL.md` — full done/not-done checklist
- `_ai_operating_system/TODO.md` — if priorities changed
- `_ai_operating_system/PLAN.md` — if execution phase changed
- `_ai_operating_system/VALIDATION_LOG.md` — if you ran `pnpm check:all`
