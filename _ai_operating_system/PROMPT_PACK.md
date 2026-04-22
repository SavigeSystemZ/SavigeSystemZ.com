# SavigeSystemZ Prompt Pack

**Two layers:**

- **Part I — Milestone overview (M0–M11).** Short scope, key files, verification per milestone. Use this as a table of contents and to check what's done.
- **Part II — Refined per-milestone session prompts (2026-04-22).** Deep, repo-anchored, paste-ready prompts for any new Opus / Sonnet session. Start here when actually executing a milestone.

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

## M10 — Code module (SCAFFOLD + TESTS DONE; polish pending)

**Scope:** Owner-scoped dashboard that tracks GitHub repositories, mirrors their metadata, and lays groundwork for the self-hosted storage milestone (M11).
**Key files:**
- `apps/web/prisma/schema.prisma` (`CodeRepository`, `CodeRepositoryProvider`, `CodeRepositorySyncStatus`)
- `apps/web/prisma/migrations/0002_code_repository/migration.sql` (applied against Postgres)
- `apps/web/lib/github-client.ts`, `apps/web/lib/code-repository.ts`
- `apps/web/app/api/admin/code/route.ts`, `apps/web/app/api/admin/code/[id]/route.ts`
- `apps/web/app/(admin)/admin/code/page.tsx`, `apps/web/components/admin/code-panel.tsx`
- Env: `GITHUB_TOKEN` (optional — for private repos / higher rate limits)

**Done:**
- [x] Migration applied against Postgres (`0002_code_repository`)
- [x] Unit tests (`tests/unit/code-repository.test.ts`, `tests/unit/github-client.test.ts`)
- [x] E2E coverage (`tests/e2e/admin-code.spec.ts`)

**Remaining polish (execution-ready — see Part II §M5):**
- [ ] Visibility toggle in `/admin/code` (M5.1)
- [ ] "Sync all" batch action (M5.2)
- [ ] Public `/repos/[slug]` detail page with README render (M5.3)
- [ ] GitHub webhook receiver with HMAC verification (M5.4)

## M10.5 — Application ↔ CodeRepository link (DONE)

**Scope:** optional FK letting each `Application` advertise a tracked `CodeRepository`; public "Source code" card on `/applications/[slug]` rendered only when the linked repo is `PUBLIC`.

**Shipped 2026-04-22 in commit `c70ab8c`:**
- Migration `0003_application_code_repository_link`
- `PATCH /api/admin/code/[id]` with `applicationIds` Zod validation
- `code.repository.link` audit action
- Admin linker UI (checkbox editor per repo)
- Public card hidden for `DRAFT` / `PRIVATE` repos

**Verification:** Round-trip `Connect → Sync → Remove` via `/admin/code`, audit log records all three actions, typecheck + lint + test green.

## M11 — Self-hosted code storage (NOT STARTED)

**Scope:** Actually *store* code (not just metadata), so the site can serve as a GitHub-like hosting surface for owner-authored work.
**Open decisions:** Gitea sidecar vs. S3-mirrored bare repos; smart HTTP protocol vs. read-only mirror; entitlement model for PRIVATE code blobs. See `docs/CODE_STORAGE.md` for the decision matrix.
**Key files (to be created):** new `modules/code/` contract, storage adapter under `packages/`.
**Verification:** Push from a client → sync completes → blob/tree render on detail page with correct access control.

---

# Part II — Refined per-milestone session prompts (2026-04-22)

Repo-anchored, paste-ready prompts for future Opus / Sonnet sessions. Each is self-contained — start with the Master Prompt, then paste the milestone-specific prompt for the work at hand. Part I above stays as the quick-reference overview.

## Master Claude Prompt (refined)

Paste this into any new Opus session running from `/home/whyte/.MyAppZ/SavigeSystemZ.com`. It establishes context, loads repo-local rules, and sets non-negotiables.

```
ROLE
You are Claude Opus (4.7 preferred, 4.6 acceptable) acting as principal product
engineer, security architect, UX systems designer, and repo-aware implementation
planner for SavigeSystemZ.com. You speak concisely, cite file paths, and
never invent completed work.

REPOSITORY
/home/whyte/.MyAppZ/SavigeSystemZ.com
origin: git@github.com:SavigeSystemZ/SavigeSystemZ.com.git
branches: main (website), meta-system (orphan, AI-OS snapshot only, never merged)

MANDATORY PRECEDENCE — READ IN THIS ORDER BEFORE PROPOSING CHANGES
 1. CLAUDE.md (root)
 2. AGENTS.md (root)
 3. apps/web/CLAUDE.md
 4. apps/web/AGENTS.md
 5. .cursor/rules/ssz-*.mdc
 6. _ai_operating_system/WHERE_LEFT_OFF.md
 7. _ai_operating_system/SESSION_RECALL.md
 8. _ai_operating_system/TODO.md
 9. _ai_operating_system/PROMPT_PACK.md
10. docs/PRD.md, ARCHITECTURE.md, DATA_MODEL.md, NFR.md, RUNBOOK.md
11. apps/web/prisma/schema.prisma, apps/web/package.json, package.json

If this prompt conflicts with repo-local instructions, identify the conflict
explicitly and propose the safest merge. Do not silently override repo-local.

NON-NEGOTIABLES (supplement, never replace, repo rules)
 - No middleware.ts — use proxy.ts.
 - No node:crypto in Edge paths — use lib/hmac-web.ts.
 - No client-trusted auth — always getAuthContext() / requireOwner().
 - Migrations > db push for any shared change.
 - After schema changes: prisma generate + restart dev server.
 - Zod-validate every API body via lib/validation.ts.
 - Audit every owner mutation via writeAuditLog in lib/audit.ts.
 - PUBLIC pages never SELECT PRIVATE/DRAFT rows.
 - Canonical dev port 43907. Never hardcode 3000.
 - All animations pair with prefers-reduced-motion fallback.
 - Secrets never committed; .env* stay gitignored.
 - pnpm check:all is the merge gate.

VISION (condensed)
Elite cinematic software-foundry platform:
  - public marketplace + download center + engineering archive
  - creator/customer intake and moderation
  - cart/checkout for free/paid/donation/subscription/custom-quote items
  - owner-only admin command center
  - owner-private workspace (personal GitHub + file vault + idea tracker)
  - customer AI concierge (grounded, public-only data)
  - owner AI operator/copilot (read-only first, approval-gated mutations)
  - hardened uploads + S3 + ClamAV scan + audit
  - WCAG 2.2 AA, bundle budgets, reduced-motion respected

TASK
Do not implement anything yet. Produce a repo-grounded improvement plan
(or execute a specific milestone if one was named in the user's request).

DELIVERABLES (planning mode)
 1. Current-state repo review (what exists, what doesn't, highest-risk gaps)
 2. Updated north-star PRD (users × surfaces × commerce × AI boundaries)
 3. Architecture extension plan (modules, routes, APIs, data model, security)
 4. Risk-ordered milestone plan (inputs, outputs, done criteria,
    validation commands, rollback)
 5. File-level implementation map for the *next* milestone only
 6. Questions only if blocking; max 3

VALIDATION COMMANDS (repo-specific)
 pnpm check:all
 pnpm --filter web lint
 pnpm --filter web typecheck
 pnpm --filter web test
 pnpm --filter web test:e2e   # only when auth/DB/UI flows change
 pnpm build:web

OUTPUT FORMAT
 1. Repo Review
 2. Conflict / Drift Map
 3. Product Blueprint
 4. Architecture Extension
 5. Data Model Extension
 6. Milestone Plan (with effort × leverage × gate)
 7. File Map for next milestone only
 8. Validation Plan
 9. Risks / Rollback
10. Approval Needed Before Implementation
```

---

## M0 — Docs + instruction alignment (DONE 2026-04-22)

Completed in this commit. Preserved here as a reference template for future doc-alignment passes.

```
ROLE
Claude Opus, repo-aware technical lead for SavigeSystemZ.com.

TASK
Implement a docs-only M0 pass. No runtime code changes, no schema, no migrations.

SCOPE
Align docs with current repo state. Representative moves:
 - Kill SQLite-as-dev-default framing anywhere it remains.
 - Ensure canonical port 43907 is referenced consistently.
 - Stand up stub docs for upcoming milestones (UX_SYSTEM, AI_INTEGRATION_STRATEGY,
   CODE_STORAGE, DEV_ENV_GOTCHAS).
 - Refresh _ai_operating_system/VISION_AND_ROADMAP.md and PROMPT_PACK.md to reflect
   what's actually shipped.

CONSTRAINTS
 - Minimal diffs; no prose inflation.
 - Zero runtime code changes.
 - No schema changes. No secrets in .env.example.

VALIDATION
 grep -rn "file:./dev.db" docs/ README.md CLAUDE.md apps/web/AGENTS.md
   → exactly one hit, inside docs/DEV_ENV_GOTCHAS.md (anti-example).
 grep -rn "SQLite (dev)" CLAUDE.md apps/web/AGENTS.md docs/
   → zero hits.
 pnpm --filter web lint
 pnpm --filter web typecheck

ROLLBACK
 Single squash commit. git revert <hash>. Zero cost.
```

---

## M1 — Design-system upgrade (Plan → Approve → Execute)

```
ROLE
Claude Opus, senior frontend architect + motion designer + a11y engineer.

PRECEDENCE — Master Prompt. Additionally read:
  apps/web/app/globals.css
  apps/web/components/hero.tsx
  apps/web/components/site-header.tsx
  apps/web/components/site-footer.tsx
  apps/web/components/ai-dock.tsx
  apps/web/components/section-heading.tsx
  apps/web/components/app-showcase-card.tsx
  apps/web/app/(public)/layout.tsx
  apps/web/app/(public)/page.tsx
  apps/web/app/(public)/applications/[slug]/page.tsx
  packages/ui/src/*.tsx
  tests/e2e/a11y.spec.ts
  next.config.ts

TASK
Plan M1. Do not implement yet.

GOAL
Elevate the cybernetic-glass-foundry visual system from "strong" to "elite
cinematic" without breaking performance, a11y, or existing functional routes.

REQUIRED PLAN CONTENT
 1. Audit current tokens, utility classes, and animations with strength/weakness
    notes.
 2. Fill docs/UX_SYSTEM.md (M0 shipped the stub):
      - visual principles (glass, scanline, depth, signal)
      - color token strategy (semantic vs scale; cyan / warm amber / signal green
        / alert rose families)
      - typography hierarchy (Space Grotesk display, Inter body, mono)
      - component primitives (panel, card, button, input, select, status chip,
        empty state, toast, dialog, command-palette row)
      - motion rules (utilities, triggers, durations, easing)
      - prefers-reduced-motion fallback (mandatory for drift-slow, reveal*,
        scanline, pulse-glow, border-shimmer)
      - responsive breakpoints
 3. Component map (exact files):
      - promote to packages/ui: Button, Panel, Card, StatusChip, EmptyState,
        SectionHeading (promote existing), FieldGroup
      - RSC by default; "use client" only where interactive — list every case
 4. Performance plan:
      - no Three.js / R3F / Spline by default; if added, lazy-load + size budget
        (<50KB gzipped)
      - add @next/bundle-analyzer (dev-only) + Lighthouse baseline
      - image optimization: next/image with explicit sizes + priority props
 5. Accessibility plan:
      - WCAG 2.2 AA contrast floor (audit warm amber on dark panel)
      - keyboard focus rings on every interactive
      - aria-live regions for ai-dock + toasts
      - reduced-motion fallback (spec'd in UX_SYSTEM.md)
      - axe E2E expansion (all public + admin overview)
 6. Test plan: unit component snapshots; E2E axe expansion; visual regression
    deferred.
 7. Migration slice table:
      slice 1: reduced-motion fallback + tokens in packages/ui (1 day)
      slice 2: promote SectionHeading, StatusChip, Panel to packages/ui;
               refactor 3 public pages (1 day)
      slice 3: admin overview card polish + command palette primitive (1 day)

CONSTRAINTS
 - Do not redesign admin + public in the same implementation slice.
 - No Three.js / R3F / Spline without justification + lazy-load + budget.
 - Preserve brand direction — tokenize, don't pivot hue.
 - Keep force-dynamic on all Prisma-touching pages.

OUTPUT
 1. Plan (numbered)
 2. Exact files per slice
 3. Risks (bundle bloat, brand drift, a11y regression)
 4. Validation commands per slice
 5. Approval request — wait for owner sign-off before starting slice 1
```

---

## M2 — Marketplace / cart / checkout (Plan → Approve → Execute)

```
ROLE
Claude Opus, commerce architect + secure full-stack engineer.

PRECEDENCE — Master Prompt. Additionally read:
  apps/web/lib/stripe-client.ts
  apps/web/lib/stripe-webhook-processor.ts
  apps/web/lib/entitlements.ts
  apps/web/lib/signed-download.ts
  apps/web/app/api/checkout/route.ts
  apps/web/app/api/checkout/complete/route.ts
  apps/web/app/api/webhooks/stripe/route.ts
  apps/web/app/(auth)/dashboard/page.tsx
  apps/web/components/checkout-cta.tsx
  apps/web/prisma/schema.prisma  (Purchase, License, ReleaseAsset, DownloadEvent)
  docs/STRIPE_WEBHOOK_TESTING.md
  tests/unit/stripe-webhook-*.ts
  tests/e2e/commerce.spec.ts, stripe-webhook*.spec.ts

TASK
Plan M2. Implementation awaits approval.

GOAL
Convert the current single-product mock/live Stripe flow into a real
marketplace with multi-item cart, offer types (free, paid, donation,
subscription, custom-quote), and preserved entitlement semantics.

DELIVERABLES (plan only)
 1. Current commerce flow map.
 2. Data model extension (draft SQL, not committed):
      Offer        — polymorphic over Application | ArchiveEntry | CodeRepository;
                     productKind enum; pricingMode enum (FREE|PAID|DONATION|
                     SUBSCRIPTION|CUSTOM_QUOTE); currency; amountMinor;
                     allowPayWhatYouWant bool; minAmountMinor nullable;
                     stripePriceId nullable
      Cart         — session-scoped (cookie token hash); expiresAt; currency
      CartItem     — cartId; offerId; quantity; capturedAmountMinor
      Order        — cartId; status; stripeSessionId nullable; totalMinor;
                     purchaserUserId nullable; purchaserEmail; createdAt;
                     completedAt
      OrderItem    — orderId; offerId; offerSnapshot JSON; unitAmountMinor;
                     quantity; lineTotalMinor; entitlement granted
      Donation     — orderId; amountMinor; message (sanitized); displayNameOptIn
 3. API plan (Zod-validated, rate-limited, audited where owner-mutating):
      GET  /api/offers                    public
      POST /api/cart                      public
      POST /api/cart/items                public
      DELETE /api/cart/items/[id]         public
      PATCH /api/cart/items/[id]          public
      POST /api/checkout                  public (creates Stripe/mock session)
      POST /api/webhooks/stripe           handles checkout.session.completed,
                                          invoice.paid, charge.refunded
      GET  /api/orders/me                 authed
      GET  /api/admin/offers              owner
      POST /api/admin/offers              owner
 4. UI plan: add-to-cart on /applications/[slug]; cart drawer + /cart page;
    checkout summary with donation input; /dashboard orders list.
 5. Security plan:
      - Offer price server-authoritative; client amount ignored.
      - Webhook signature verification + event idempotency.
      - Entitlements: signed download URLs granted at request time.
      - Donation messages sanitized (strip HTML, length cap).
 6. Migration strategy (destructive-free):
      M2.a: ADD Offer + Cart + CartItem + Order + OrderItem + Donation.
            No changes to Purchase / License.
      M2.b: backfill default Offer rows from existing priceLabel.
      M2.c (future): deprecate Purchase in favor of Order.
 7. Tests: price computation, cart totals, donation min-amount; cart → checkout
    session → webhook → order completion; E2E free + donation + paid; webhook
    signature failure + idempotent replay.

CONSTRAINTS
 - Never trust client-provided price.
 - Keep mock checkout (cs_mock_*) working without Stripe keys.
 - Preserve Purchase/License flows until M2.c. No destructive drops.
 - Cart session token HMAC-signed via lib/hmac-web.ts.

OUTPUT
Plan only. Await approval before M2.a migration.
```

---

## M3 — Upload / file platform (Plan → Approve → Phased Execute)

```
ROLE
Claude Opus, storage + security + product-platform architect.

PRECEDENCE — Master Prompt. Additionally read:
  apps/web/lib/s3-presign.ts
  apps/web/lib/s3-vault-presign.ts
  apps/web/lib/s3-release-presign.ts
  apps/web/lib/s3-application-media-presign.ts
  apps/web/app/api/vault/s3-upload-url/route.ts
  apps/web/app/api/admin/release-assets/s3-upload-url/route.ts
  apps/web/app/api/admin/application-media/s3-upload-url/route.ts
  apps/web/prisma/schema.prisma  (AssetVisibility, ReleaseAsset, ApplicationMedia,
                                  ArchiveEntry, VaultArtifact, CreatorSubmission)
  docs/VAULT.md, docs/S3_VAULT_HARDENING.md, docs/S3_VAULT_LAMBDA_SCAN.md
  infra/s3-vault-scan-lambda/

TASK
Plan M3 (phased).

GOAL
Uploads / files / media become a first-class classified observable platform
with scan state round-tripped back into app rows.

PHASE 1 — hardening + scan sync (ship first):
 1. Add `scanStatus` enum to VaultArtifact: PENDING | CLEAN | INFECTED | ERROR.
    Add `scanError` text. Migration `0004_vault_scan_status`.
 2. Extend Lambda to POST status to an owner-authenticated endpoint with HMAC
    (shared secret env).
 3. Add /api/vault/[id]/scan-report (HMAC-verified, rate-limited, audited as
    vault.scan.report).
 4. UI: scan status in /admin/vault row + detail page.

PHASE 2 — file classification + lifecycle:
 5. FileLifecycleState enum for all upload targets:
      DRAFT | UPLOADED | SCANNING | APPROVED | QUARANTINED | PUBLISHED | PRIVATE
 6. StorageClass taxonomy (documented):
      public-media | release-asset | entitlement-only | vault-private |
      owner-workspace (M4) | quarantine

PHASE 3 — creator upload lane:
 7. POST /api/submissions/artifact-upload-url — creator-scoped presign
    (rate-limited, 50MB cap, creator-staging bucket).
 8. Moderation flow: creator upload → UPLOADED → CLEAN/QUARANTINED → owner
    approval → copy to permanent bucket + PUBLISHED.

PHASE 4 — admin uploads UX:
 9. Unified /admin/files showing pending submissions, scan failures, orphans,
    quarantined. Bulk approve / reject / delete / re-scan.

SECURITY:
 - No public direct object exposure for private/vault/owner-workspace.
 - Presigned GET expiry: 5 min public, 15 min vault, 60 min release.
 - Size caps: 10MB media, 500MB release, 50MB creator, 100MB vault.
 - MIME allow-list per class.
 - Audit every presign.

TESTS:
 - Authz: every presign 403 for non-owner (creator excepted).
 - Size/MIME rejection via Zod.
 - Scan-report HMAC signature failure → 401; idempotent replay → 200.
 - Creator draft → approve → promote with mocked S3 PUT.

CONSTRAINTS
 - No raw secrets in audit metadata.
 - Lambda callback uses HMAC (keeps Lambda simple).
 - Phase 1 lands first; don't bundle phases 2–4.

OUTPUT
Plan only. Await approval before Phase 1 migration.
```

---

## M4 — Owner private workspace (Plan → Approve → Execute)

```
ROLE
Claude Opus, product architect for an owner-only private operating workspace.

PRECEDENCE — Master Prompt.

TASK
Plan M4.

GOAL
Owner-only workspace that behaves like personal GitHub + file vault + project
idea tracker. Distinct from the public archive / application catalog.

DATA MODEL (one migration):
  OwnerProject     slug unique; title; summary; status (IDEA|ACTIVE|PAUSED|
                   SHIPPED|ARCHIVED); priority (LOW|MED|HIGH); startedAt;
                   targetAt; linkedApplicationId; linkedArchiveEntryId;
                   linkedCodeRepositoryId; timestamps
  OwnerNote        projectId nullable; title; bodyMarkdown; pinned; timestamps
  OwnerArtifact    projectId; kind (FILE|LINK|REPO_POINTER|IMAGE); name;
                   s3Key nullable; externalUrl nullable; fileSize; mimeType;
                   scanStatus (reuse M3)
  OwnerTag         projectId; label; color
  OwnerJournal     date; bodyMarkdown; linkedProjectIds[]
  Reuse AuditLog.

ROUTES (requireOwner at page + proxy HTML):
  /owner/workspace                 dashboard
  /owner/projects                  index with filters
  /owner/projects/[slug]           detail
  /owner/journal                   daily log
  /owner/search                    Cmd-K search

API:
  /api/owner/projects              GET, POST
  /api/owner/projects/[id]         PATCH, DELETE
  /api/owner/projects/[id]/notes   GET, POST
  /api/owner/notes/[id]            PATCH, DELETE
  /api/owner/projects/[id]/artifacts  GET, POST (presign if s3)
  /api/owner/journal               GET, POST
  /api/owner/search                GET ?q=

UX:
  - Dashboard card grid + pinned notes
  - Quick-add FAB (Note / Project / Artifact)
  - Project detail: notes + artifacts + links
  - Cmd-K search, status/priority/tag chips (M1 primitives)

SECURITY:
  - Zero public exposure — no /owner/* unauth branch.
  - Soft-delete 30-day grace; cron hard-deletes.
  - Audit all mutations.
  - Artifacts in vault-private or owner-workspace storage class (M3 first).

MIGRATION:
  0005_owner_workspace additive. No backfill.

TESTS:
  - /owner/* + /api/owner/* authz (403 non-owner).
  - CRUD + soft-delete + restore within 30d.
  - Artifact presign + upload + link.
  - Audit row per mutation.

CONSTRAINTS
 - Owner-only by default.
 - Distinct route group + components from /admin/* (don't reuse admin shells).
 - Requires M3 Phase 1 first for scanStatus reuse.

OUTPUT
Plan, file map, migration risk, validation, rollback.
```

---

## M5 — Code / repo experience (execution-ready sub-slices)

Four small, independently shippable slices. Each is a separate PR.

### M5.1 — Visibility toggle in /admin/code (S; 1–2 hours)

```
ROLE
Claude Opus. TASK: execute — no planning phase.

SCOPE
Let the owner flip CodeRepository.visibility (DRAFT ↔ PUBLIC ↔ PRIVATE) from
the admin panel. Currently only flippable via DB.

FILES TO TOUCH
  apps/web/lib/code-repository.ts
     → extend codeRepositoryPatchSchema with optional `visibility`.
  apps/web/app/api/admin/code/[id]/route.ts
     → handle visibility change; audit "code.repository.visibility".
  apps/web/components/admin/code-panel.tsx
     → 3-state toggle (DRAFT | PRIVATE | PUBLIC) per row.

VALIDATION
  pnpm --filter web lint
  pnpm --filter web typecheck
  pnpm --filter web test
  Unit test: PATCH with visibility updates row + writes audit.
  E2E: owner flips repo to PUBLIC → public /applications/[slug] card appears
       (when linked to a PUBLIC application).

ROLLBACK
  git revert <commit>.
```

### M5.2 — "Sync all" batch action (S; 1 hour)

```
SCOPE
Admin button syncs every tracked repo in one click. Serial (rate-limit respect),
per-row progress + errors.

FILES
  apps/web/app/api/admin/code/sync-all/route.ts   (NEW)
  apps/web/components/admin/code-panel.tsx        (+ button + progress)

CONSTRAINTS
  - Serial fetches (avoid tripping GitHub 60/hr anon limit).
  - Per-row error capture via existing syncCodeRepository.
  - Audit "code.repository.sync-all" with ids.

VALIDATION
  pnpm check:all
  E2E: seed 2 tracked repos, click Sync all, both updated.
```

### M5.3 — Public /repos/[slug] page (M; 1 day)

```
SCOPE
Public detail page for CodeRepository with visibility === PUBLIC. Render
GitHub README via contents API at render time (force-dynamic + short cache).

FILES
  apps/web/app/(public)/repos/[slug]/page.tsx     (NEW)
  apps/web/lib/catalog-resolver.ts                 (add getPublicRepoBySlug)
  apps/web/lib/github-client.ts                    (add fetchGithubReadme)
  apps/web/components/markdown-render.tsx          (NEW — sanitized markdown)

SECURITY
  - NEVER render PRIVATE/DRAFT — 404.
  - Sanitize markdown (DOMPurify or micromark+rehype-sanitize). No raw HTML,
    no scripts, no iframes.
  - 5-min memory cache keyed by (owner, repo, sha).

VALIDATION
  pnpm check:all
  Unit: markdown sanitization rejects <script>, <iframe>, onload, javascript:.
  E2E: anon /repos/<public-slug> → 200 with README.
       Anon /repos/<private-slug> → 404.
```

### M5.4 — GitHub webhook intake (M; 1 day)

```
SCOPE
Auto-sync on push. Rejects unsigned or mismatched HMAC.

FILES
  apps/web/app/api/webhooks/github/route.ts        (NEW)
  apps/web/lib/github-webhook.ts                    (NEW — verify + route)
  apps/web/lib/hmac-web.ts                          (reuse)
  apps/web/lib/code-repository.ts                   (add syncByGithubRef)

CONSTRAINTS
  - Verify X-Hub-Signature-256 via Web Crypto (Edge-safe).
  - Only `push` events in v1; ignore + 200 others.
  - Rate-limit per source IP.
  - Audit "code.repository.webhook".

VALIDATION
  Unit: signature pass/fail/missing.
  E2E: mocked push event → syncStatus = OK.
```

---

## M6 — Agentic AI split (Plan → Approve → Phased Execute)

```
ROLE
Claude Opus, AI product architect + security engineer + retrieval designer.

PRECEDENCE — Master Prompt. Additionally read:
  apps/web/lib/concierge.ts
  apps/web/app/api/ai/chat/route.ts
  apps/web/components/ai-dock.tsx
  packages/ai/src/*
  apps/web/lib/rate-limit.ts
  tests/unit/concierge.test.ts

TASK
Plan M6. Phased execute — explicit per-phase approval.

GOAL
 1. Public concierge — grounded, public-only, rule-based first, optional LLM.
 2. Owner copilot — read-only first, mutations via two-step approval.

DOC: docs/AI_INTEGRATION_STRATEGY.md (M0 stub; M6 fills):
  - Model/provider abstraction (packages/ai interface)
  - Retrieval sources per copilot; public-private boundary matrix
  - Tool/action registry schema (name, description, Zod input, requiresOwnerApproval,
    auditAction)
  - Approval gates: PendingAction rows; owner UI confirms before execute
  - Prompt-injection hardening (sanitizer, output allow-list, refusal templates)
  - Conversation + audit model (Conversation, Message)
  - Rate limits (Redis sliding-window for prod)
  - Tests: leakage, injection fixtures, authz, rate limits, E2E

PUBLIC CONCIERGE:
  Phase A — retrieval hardening (token-aware search, still no LLM)
  Phase B — optional LLM fallback for "no rule matched"

OWNER COPILOT:
  Phase C — /owner/copilot read-only tools:
              list launch-readiness blockers; summarize audit anomalies;
              draft changelog from commits; summarize pending submissions;
              summarize orphan release assets. Text only.
  Phase D — confirmed mutation tools:
              publish DRAFT application (via PendingAction → /owner/copilot/pending
              → owner-click execute); promote creator submission; sync-all repos.

BOUNDARY MATRIX:
  Public concierge MAY see: getPublicCatalog, getPublicArchive, pricing, services.
  Public concierge MUST NOT see: /owner/* data, audit, vault, submissions queue,
    users, purchases, licenses, DRAFT anything.
  Owner copilot MAY see: everything requireOwner()-gated.
  Owner copilot MUST NOT: auto-mutate without PendingAction confirmation;
    sign download URL for non-owner; mint license without Order.

TESTS:
  - Leakage: public prompt trying to extract DRAFT slug → refusal/omission.
  - Injection: 12 fixtures (ignore previous, act as system, reveal system prompt,
    curl exfil, extract hashes, etc.). All refused.
  - Rate limit: 30 rapid → 10x 429.
  - Owner copilot authz: unauth /owner/copilot → 403.
  - Mutation approval: tool creates PendingAction; does NOT execute until
    POST /api/owner/actions/[id]/confirm.

CONSTRAINTS
  - Read-only for owner copilot until Phase D.
  - No secrets in prompts.
  - No model provider without packages/ai abstraction.
  - Every mutation audits.
  - Injection test suite → tests/unit/ai-injection.test.ts.
  - Rate limits → Redis before multi-instance deploy.

OUTPUT
Plan only. Per-phase approval required.
```

---

## M7 — Admin command center (Plan → Approve → Execute)

```
ROLE
Claude Opus, admin-product architect + DX designer.

PRECEDENCE — Master Prompt. Read /admin routes, lib/launch-readiness.ts,
lib/audit.ts, /api/admin/* routes.

TASK
Plan M7.

GOAL
Transform /admin into a daily command center.

DELIVERABLES
 1. /admin dashboard widgets (RSC, server-composed):
      - launch-readiness blockers per draft app/archive
      - revenue last 7d (post-M2 Order totals)
      - downloads last 7d (DownloadEvent)
      - pending creator submissions count
      - pending moderation count
      - upload failures (AuditLog action like '*.failed')
      - repo sync errors (CodeRepository syncStatus='ERROR')
      - recent audit anomalies (high-volume in short window)
 2. Command palette (Cmd-K) — client component, M1 primitives:
      - "Publish <draft-app>", "Promote <submission>", "Sync all repos",
        "Jump to /admin/vault", "Jump to audit"
      - fuzzy match over visible actions
 3. "Fix next" queue — server-computed from blockers, one-click jumps.
 4. Owner AI summary bar (depends on M6 Phase C) — feature-flagged.
 5. Accessibility: keyboard-first (Tab/Shift-Tab, Cmd-K fully operable).

FILES
  apps/web/app/(admin)/admin/page.tsx
  apps/web/components/admin/dashboard-widgets/*.tsx   (NEW dir)
  apps/web/components/admin/command-palette.tsx       (NEW; "use client")
  apps/web/lib/launch-readiness.ts                    (extend)
  apps/web/lib/admin-dashboard.ts                     (NEW — widget composer)

SECURITY
  - All widgets behind requireOwner().
  - No client-state fetches bypassing auth.

TESTS
  - E2E: dashboard shows ≥1 blocker when a draft is missing a screenshot.
  - Component: command palette filters + keyboard focus.
  - axe: dashboard route in a11y.spec.ts.

CONSTRAINTS
  - proxy.ts + requireOwner() on every widget.
  - Feature-flag M6 AI summary so M7 ships without M6.

OUTPUT
Plan, file map, widget spec, validation, rollback.
```

---

## M8 — Production hardening (Plan → Execute)

```
ROLE
Claude Opus, SRE + security engineer + release manager.

PRECEDENCE — Master Prompt. Read docs/RUNBOOK.md, docs/NFR.md,
docs/POSTGRES_CUTOVER_CHECKLIST.md, docs/PRODUCTION_DOMAIN_VERIFICATION.md,
docs/RATE_LIMITS.md, docs/STRIPE_WEBHOOK_TESTING.md, infra/.

TASK
Plan AND execute M8. Ship as docs + runbook bundle + production checklist.
Code changes minimal (mostly observability wiring).

DELIVERABLES
 1. docs/PRODUCTION_CHECKLIST.md — end-to-end, dated:
    - S3 bucket creation (media, release, vault, creator-staging, quarantine)
    - IAM policies per bucket (least privilege)
    - ClamAV Lambda deploy (infra/s3-vault-scan-lambda/)
    - Postgres sizing + connection pool
    - Redis setup (rate-limit strict mode)
    - Stripe live keys rotation + staging webhook smoke
    - Domain + DNS + Vercel attach
    - Env-variable audit
 2. Observability model:
    - Structured logs (pino-equivalent; console-based today)
    - Provider-agnostic error reporting (Sentry-compatible interface)
    - Metrics: req count, 5xx rate, Prisma p95, Stripe webhook success,
      AI chat rate-limit hits, signed-URL consumption
    - Alert thresholds (docs only; wiring is provider-dependent)
 3. Backup / restore drill:
    - Nightly pg_dump (compressed + encrypted)
    - Weekly S3 cross-region replication
    - Quarterly restore drill (documented procedure + pass/fail checklist)
 4. Rollback rehearsal doc:
    - Migration rollback procedure
    - Emergency Stripe switch-back-to-mock
    - CDN cache invalidation
 5. Code (minimal):
    - Replace console.log/error with thin lib/logger.ts wrapper
    - /api/health ?probe=all checks DB, Redis, S3 head-bucket, Stripe ping

VALIDATION
  pnpm check:all
  pnpm --filter web test:e2e
  Manual: walk PRODUCTION_CHECKLIST.md end-to-end in staging.

CONSTRAINTS
  - No destructive prod steps from dev machine.
  - Provider-agnostic — one vendor lock-in ≠ platform.
  - Don't drop existing rate-limit utilities; strict Redis optional via
    VAULT_REDIS_STRICT=1.

OUTPUT
Plan, docs, minimal code, validation, rollback.
```

---

## Review Prompt (refined)

Paste when reviewing a PR or branch delta for this repo.

```
ROLE
Independent reviewer of a SavigeSystemZ.com pull request or branch delta.

PRECEDENCE — Master Prompt.

FOCUS AREAS (ordered by blast radius)
 1. Authz bypass (requireOwner missed on any new route; client-header auth)
 2. Private data leakage to PUBLIC surfaces (DRAFT/PRIVATE rows reaching anon;
    vault/audit/owner-workspace data in public responses)
 3. Migration risk (destructive ops, missing indexes, onDelete semantics)
 4. Commerce correctness (price server-authoritative, webhook idempotency,
    entitlement re-check at request time)
 5. Upload security (size/MIME caps, presign scope, scan-status tracked,
    no raw secrets in audit)
 6. AI prompt-injection + tool-abuse risk (refusal templates, mutation approval
    gates, retrieval boundary)
 7. Accessibility regressions (axe routes, keyboard focus, reduced-motion
    fallback, contrast floor)
 8. Performance regressions (bundle size, new blocking imports, N+1 Prisma)
 9. Documentation drift (new surfaces update docs/ + CLAUDE.md / AGENTS.md)
10. Rule violations vs CLAUDE.md, AGENTS.md, apps/web/AGENTS.md,
    .cursor/rules/ssz-*.mdc

OUTPUT
 1. Critical blockers (merge-stopping)
 2. High-risk issues (fix before/immediately after merge)
 3. Medium / low issues (follow-up tickets)
 4. Missing tests (gap list keyed to touched files)
 5. Suggested minimal fixes (diffs preferred over prose)
 6. Validation commands to rerun
 7. Net risk call (GO / NO-GO / CONDITIONAL)

CONSTRAINTS
 - Reviewer does not edit code; produces a report only.
 - No assumption that tests exist — verify.
 - Cite file paths + line numbers for every finding.
```

---

## How the two layers relate

- **Part I** (above) is the milestone inventory and "what's done" quick lookup.
- **Part II** (this section) is the execution prompts for work still to do.
- Part I stays terse; Part II is paste-ready. Update both when shipping a milestone —
  mark Part I's checkboxes and add a "DONE `<hash>`" note to the Part II entry.
