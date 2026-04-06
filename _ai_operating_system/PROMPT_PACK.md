# SavigeSystemZ Prompt Pack (M0-M9)

Milestone-scoped prompts for AI agents. Each milestone has a planning phase and implementation phase. Always check `SESSION_RECALL.md` and `TODO.md` before starting any milestone work.

## Universal rules (all milestones)

- Read `WHERE_LEFT_OFF.md` before starting
- Run `pnpm check:all` after substantive changes
- Follow non-negotiable rules in root `CLAUDE.md`
- Update `SESSION_RECALL.md` and `WHERE_LEFT_OFF.md` when stopping
- Never skip auth, validation, or audit logging on new routes
- Match existing code patterns — read sibling files before writing

## M0 — Foundation (DONE)

**Scope:** Monorepo skeleton, canonical docs, design system foundations, Prisma schema, dev tooling.
**Key files:** `package.json`, `turbo.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `prisma/schema.prisma`
**Verification:** `pnpm install && pnpm check:all` passes.

## M1 — Flagship shell and design system (DONE)

**Scope:** Public page layouts, header/footer, typography, color system, motion, responsive design.
**Key files:** `app/(public)/layout.tsx`, `app/(public)/page.tsx`, `app/globals.css`, `app/layout.tsx`
**Verification:** All public routes render, no accessibility violations on axe scan.

## M2 — Catalog, detail pages, releases (DONE)

**Scope:** Application catalog with Prisma-backed data, detail pages, version/release model, media model.
**Key files:** `app/(public)/applications/`, `lib/catalog-resolver.ts`, `prisma/schema.prisma`
**Verification:** `/api/catalog` returns seeded data, detail pages render with images and metadata.

## M3 — Admin manager (DONE)

**Scope:** Owner dashboard, application/release/archive/media managers, moderation queue, audit viewer.
**Key files:** `app/(admin)/admin/`, `components/admin/`, `app/api/admin/`
**Verification:** Admin routes require auth, CRUD operations work, audit log records mutations.

## M4 — AI concierge (DONE)

**Scope:** Concierge logic grounded in real catalog/archive routes.
**Key files:** `lib/concierge.ts`, `packages/ai/`
**Verification:** Concierge returns suggestions that link to real existing routes.

## M5 — Reviews, comments, project requests (DONE)

**Scope:** Review display, project request intake with honeypot spam protection.
**Key files:** `app/(public)/reviews/`, `app/api/project-requests/`, `lib/project-request-honeypot.ts`
**Verification:** Public review page renders, project request submission works with spam gate.

## M6 — Creator submission pipeline (DONE)

**Scope:** Creator intake form, moderation queue, promotion bridge to draft applications/archive entries.
**Key files:** `modules/creator-submissions/`, `lib/creator-promotion.ts`, `app/api/admin/moderation/`
**Verification:** Submit -> moderate -> promote flow works end-to-end.

## M7 — Private vault (DONE)

**Scope:** AES-256-GCM encrypted vault, S3 hybrid storage, Redis rate limiting, key rotation.
**Key files:** `lib/vault-crypto.ts`, `lib/vault-payload.ts`, `lib/vault-rate-limit.ts`, `app/api/vault/`
**Verification:** Vault CRUD with encryption roundtrip, rate limiting blocks excessive requests.

## M8 — Commerce and entitlements (DONE)

**Scope:** Stripe checkout, webhook processing, signed downloads, license/entitlement model.
**Key files:** `lib/stripe-client.ts`, `lib/stripe-webhook-processor.ts`, `lib/signed-download.ts`, `lib/entitlements.ts`
**Verification:** Mock checkout flow, webhook idempotency, signed URL generation/validation.

## M9 — Hardening and launch (IN PROGRESS)

**Scope:** Security hardening, guided launch composers, production readiness, Postgres cutover, CI/CD.
**Key files:** `proxy.ts`, `docs/SECURITY_HARDENING.md`, `lib/launch-readiness.ts`, `docs/LAUNCH_CHECKLIST.md`
**Remaining work:**
- [ ] Archive launch composer (guided draft-to-launch, matching application launch composer)
- [ ] Creator-to-launch handoff (reduce manual navigation after promotion)
- [ ] Real S3 bucket wiring and verification
- [ ] Playwright expansion for new admin flows
- [ ] Postgres cutover (provider flip, new migrations, CI)
- [ ] Git remote + push
- [ ] Domain verification on Vercel
**Verification:** `pnpm check:all`, Playwright E2E green, Lighthouse scores acceptable, security negative tests pass.
