# Where Left Off

- **Timestamp:** 2026-04-29 (Claude Code session; ownership unblocked, M7 slice 6 + /repos index + admin JSON size sweep landed; full quality gate green)
- **Status:** Site is live on `http://127.0.0.1:43907/` again. Ownership corruption fully resolved — `sudo chown -R whyte:whyte` ran cleanly, 0 files outside `whyte:whyte`. Migrations `0004_purchase_email_index_and_stripe_event_dedupe` and `0005_dashboard_alert_and_code_storage_backend` applied to local Postgres. `pnpm check:all` green (lint + typecheck + 138 unit tests + build).
- **Shipped this session (uncommitted working tree):**
  - **Smart desktop launcher:** `~/Desktop/SavigeSystemZ-local.desktop` re-installed via `installer/desktop/install-desktop-launcher.sh --smart`. Now invokes `installer/packaging/appimage/AppRun` which acquires a single-instance flock, probes 43907 via /dev/tcp, spawns `pnpm dev:web` if free, polls 30s, then opens browser. No more "connection refused" when the icon is clicked cold.
  - **`apps/web/app/error.tsx`:** swapped raw `<a href="/">` for `next/link` `<Link>` to clear the @next/next/no-html-link-for-pages lint that was blocking `pnpm check:all`.
  - **Stripe webhook unit test fix:** `tests/unit/stripe-webhook-processor.test.ts` now mocks `@/lib/db` (stripeWebhookEvent + purchase) so it doesn't crash on missing DATABASE_URL after the P0 idempotency fix added `markEventProcessed()` to the dispatcher.
  - **M7 slice 6 — dismissible spike notices + ack state (CLOSED):**
    - `lib/admin-dashboard.ts`: new `recordSpikeAlerts(window, spikes, trends)` helper upserts `DashboardAlert` rows keyed `spike:<lane>:<window>` whenever a lane fires a spike (re-firing clears any prior ack). New `listActiveDashboardAlerts()` returns unacknowledged alerts ordered by `lastSeenAt`. `getAdminDashboardSummary()` now records spikes + returns `activeAlerts: AdminDashboardAlert[]` on the summary.
    - `components/admin/dashboard-spike-notices.tsx`: new client component that renders unack'd alerts as severity-toned dismissible cards with an Inspect link (from metadata.href) and a Dismiss button that POSTs `/api/admin/dashboard/acknowledge` and calls `router.refresh()`.
    - `app/(admin)/admin/page.tsx`: mounted `<DashboardSpikeNotices alerts={dashboard.activeAlerts} />` directly under the owner header banner.
    - Pre-existing `app/api/admin/dashboard/acknowledge/route.ts` is the backing API (Zod-validated, owner-gated, IP+user rate-limited at 60/min, audit log `admin.dashboard.alert.acknowledge`, idempotent).
    - `tests/unit/admin-dashboard.test.ts` now mocks `dashboardAlert.upsert` + `findMany`, asserts spike upserts happen for the right lanes, and adds a second test that surfaces an unack'd alert via `summary.activeAlerts`. 134 → 138 unit tests.
  - **Public `/repos` index page (CLOSED):** `app/(public)/repos/page.tsx` lists PUBLIC `CodeRepository` rows (60 max) ordered by latest commit, each card showing description, primary language chip, stars/forks/open-issues, latest-commit relative time, default branch, "Open repository" → `/repos/[slug]` and "View on GitHub" links. Backed by new `listPublicRepos()` in `lib/catalog-resolver.ts`.
  - **README sanitizer hardening:** `components/markdown-render.tsx` regex updated — script/iframe close-tag now allows trailing whitespace (`<\/script\s*>`), event-handler regex now requires a leading whitespace boundary (`(\s)on\w+\s*=`) so it cannot eat `function on(x)` or other non-attribute occurrences, and accepts unquoted/single-quoted/double-quoted values. `tests/unit/markdown-render.test.ts` extended with 4 new fixtures: data:/file:/ftp:/mailto:/protocol-relative href rejection, mixed-case + multiline `<ScRiPt>` payloads, single-quoted + unusual-whitespace event handlers, and a "plain text isn't a tag" guard.
  - **Admin JSON size limits sweep (P1):** all admin POST/PATCH JSON routes now use `readJsonBody(request, MAX_BYTES)` returning 413 on oversize and 400 on invalid JSON. Caps: 256 KB for `applications/[id]/launch-compose` + `archive/launch-compose` (markdown changelogs), 64 KB for `applications` POST/PATCH + `archive` POST/PATCH + `versions/[id]` PATCH, 32 KB for `application-media` POST/PATCH + `creator-submissions/[id]` PATCH + `release-assets/[id]` PATCH, 16 KB for `code` POST + `code/[id]` PATCH + `project-requests/[id]` PATCH, 8 KB for the three `s3-upload-url` routes. All paired with the existing Zod schemas.
- **Validation:** `pnpm check:all` exit 0 (5 cached, 1 live; 8.13s). 25 test files / 138 unit tests pass. `curl http://127.0.0.1:43907/api/health` → `{ok:true}`. `curl /repos` → 200.
- **Next actionable (in order):**
  1. Commit the working tree — many P0/P1 changes from prior session + this session are still uncommitted. Recommended split: (a) ownership-unrelated P0/P1 (cursor rules, force-dynamic, audit, vault per-user gate, OWNER_LOGIN_SECRET guard, Stripe idempotency, smart launcher, packaging workflow), (b) this-session work (M7 slice 6, /repos index, sanitizer hardening, JSON size sweep, error.tsx fix).
  2. Burn remaining P1s: REFUNDED PurchaseStatus + `POST /api/admin/purchases/[id]/refund` (needs schema migration), wrap `lib/checkout-complete.ts` license-grant + purchase-update in a `db.$transaction`, GitHub README rate-limit + per-repo sync debounce, audit-log retention policy.
  3. Add E2E coverage for the new `/repos` index, the spike-notice dismiss flow, and admin publish flows.
  4. Workstream B owner round-trip: connect a real GitHub repo via `/admin/code`, flip to PUBLIC, verify the public `/repos` and `/repos/[slug]` surfaces.
- **Blocked / external input (unchanged):** S3 creds, Stripe live keys, Vercel DNS, GITHUB_TOKEN for private-repo sync, AWS Lambda deploy access for vault scan.

---

- **Timestamp:** 2026-04-27 (Claude Code session; review + P0 fixes + cursor rules + packaged launcher landed)
- **Status:** Ownership corruption from a prior `sudo` run on 2026-04-22 has spread beyond `.git` to ~321 source files (root:root, mode 640) including `packages/ui/src/Panel.tsx`, `packages/ui/src/StatusChip.tsx`, `packages/ui/src/SectionHeading.tsx`, `packages/ui/src/CommandPaletteRow.tsx`, `apps/web/lib/admin-dashboard.ts`, `apps/web/lib/github-webhook.ts`, `apps/web/components/markdown-render.tsx`, `apps/web/components/admin/command-palette.tsx`, `apps/web/components/admin/auto-refresh.tsx`, `apps/web/app/(public)/repos/`, all admin/code/dashboard tests, and `.turbo/cache/*`. **`pnpm dev:web` cannot start — site is unreachable.** Single fix: `sudo chown -R whyte:whyte /home/whyte/.MyAppZ/SavigeSystemZ.com`. This also unblocks ultraplan (`git bundle create --all` was failing), git fsck, and any future commits.
- **Shipped this session (no commits — git is locked):**
  - **Plan:** `/home/whyte/.claude/plans/further-enhance-and-improve-eager-nygaard.md`.
  - **Comprehensive review:** `_ai_operating_system/REVIEW_2026-04.md` — 68 findings (12 P0 / 40 P1 / 16 P2) with `file:line` citations.
  - **P0 fixes applied:**
    - `force-dynamic` on 8 admin pages (`app/(admin)/admin/{,audit,archive,media,moderation,releases,vault,requests}/page.tsx`).
    - Stripe webhook idempotency: new `StripeWebhookEvent` Prisma model + `claimStripeWebhookEvent()` helper in `lib/stripe-webhook-processor.ts` + dedupe in `app/api/webhooks/stripe/route.ts`. Migration `prisma/migrations/0004_purchase_email_index_and_stripe_event_dedupe/migration.sql` created (apply with `pnpm --filter web exec prisma migrate deploy` once DB is reachable).
    - `Purchase.purchaserEmail` index added to schema + same migration above.
    - `OWNER_LOGIN_SECRET` startup guard in `lib/auth.ts` — fails boot in production if unset / default / `< 32` chars.
    - Vault rate limit per-user scoping: `vaultMutationGate(request, userId?)` keys on user when authed; both callers (`app/api/vault/route.ts`, `app/api/vault/s3-upload-url/route.ts`) updated to pass `context.userId`.
    - Soft-delete on admin/project-requests already correct via `projectRequestsWhere` helper — no change needed.
  - **Cursor rules refreshed and added:** `.cursor/rules/00-ai-context.mdc`, `ssz-01-monorepo.mdc`, `ssz-02-apps-web.mdc`, `ssz-03-prisma.mdc`, `ssz-04-security-web.mdc` rewritten for current Next.js 16 / Postgres-first / port 43907 reality. New master rule `ssz-05-agent-execution.mdc` covers execution discipline, output standards, hard "do not" list, pre-merge checklist.
  - **Claude memory mirroring:** `~/.claude/projects/-home-whyte--MyAppZ-SavigeSystemZ-com/memory/feedback_execution_discipline.md` and `reference_architecture_invariants.md` added; `MEMORY.md` index updated. Future Claude sessions auto-load the same standards as Cursor.
  - **Workstream B — packaged launcher:** rewritten `installer/packaging/appimage/AppRun` (single-instance `flock`, `/dev/tcp` port probe, repo resolution via `SAVIGESYSTEMZ_REPO` or `$HOME/.MyAppZ/SavigeSystemZ.com`, spawns `pnpm dev:web`, polls 30s, opens browser, traps to tear server down). New AppImage desktop file `installer/packaging/appimage/savigesystemz.desktop`. Filled in `installer/packaging/deb/{control,postinst,prerm}`. Real `installer/scripts/build-packages.sh` pipeline (stages AppDir + dpkg-deb tree, calls `appimagetool`, emits `dist/packages/{*.AppImage,*.deb,SHA256SUMS}`). Extended `installer/scripts/validate-install.sh` with `--appimage` smoke mode (launches latest AppImage, polls port, hits `/api/health`). Added `--smart` and `--package` modes to `installer/desktop/install-desktop-launcher.sh`. `.github/workflows/packaging.yml` rewritten to vendor `appimagetool`, build on tag push or manual dispatch, upload artifacts, attach to GitHub Release.
- **Validation:** Bash syntax-checked all installer scripts (`bash -n`) — clean. `pnpm check:all` **not run** — the chown blocker prevents reading `node_modules` and source files.
- **Additional Workstream C / P1 polish landed (post-summary):**
  - `next.config.ts` — AVIF/WebP image formats, S3 + GitHub remote patterns, `@next/bundle-analyzer` wired behind `ANALYZE=1`. Add devDep with `pnpm add -D -F web @next/bundle-analyzer`.
  - `vitest.config.ts` — V8 coverage with text/html/lcov reporters, soft thresholds (60% lines/functions/statements, 50% branches).
  - `playwright.config.ts` — `screenshot: "only-on-failure"`, `video: "retain-on-failure"`, GitHub reporter under CI.
  - `app/error.tsx` — rewritten as a proper nested error boundary (no `<html>`/`<body>`); branded retry UI with digest exposure.
  - `app/global-error.tsx` — new; root-layout-failure boundary with `<html>`/`<body>` wrapper.
  - `lib/s3-presign.ts` — TTL capped at 1h via `Math.min`.
  - `lib/s3-release-presign.ts` — content-type allow-list (`isAllowedReleaseContentType`); rejects browser-executable types before signing.
  - `app/api/checkout/route.ts` — mock session id now `randomUUID()` instead of `randomBytes(16)`.
  - `app/api/admin/code/[id]/route.ts` — per-owner rate limits: PATCH 60/min, sync 12/min, DELETE 30/min.
  - `lib/stripe-webhook-processor.ts` — switch dispatch handles `checkout.session.expired` (mark FAILED) and `payment_intent.payment_failed` (audit log); unknown types accepted.
  - `lighthouserc.json` — perf ≥ 0.9, a11y ≥ 0.95, CLS ≤ 0.05 thresholds across 6 public routes.
  - `lib/json-body.ts` — new `readJsonBody(request, maxBytes)` helper with `content-length` + post-decode size enforcement, default 256 KB cap.
  - `app/api/admin/versions/route.ts`, `app/api/admin/release-assets/route.ts` — adopt `readJsonBody` (64 KB cap, 413 on oversize).
  - `scripts/post-chown-verify.sh` — single-command verifier the user runs after the chown: ownership sweep, `git fsck`, Postgres up-check, `prisma migrate deploy`, `pnpm check:all`, dev-server boot, `/api/health` probe. Bails on first failure with a clear message.
- **Next actionable (in order):**
  1. **You:** `sudo chown -R whyte:whyte /home/whyte/.MyAppZ/SavigeSystemZ.com`. Optionally `sudo chmod -R u+rwX,go+rX .git` if anything still 640.
  2. Verify: `git fsck --full` clean, `pnpm dev:web` boots, `curl -fsS http://127.0.0.1:43907/api/health`.
  3. Apply migrations: `pnpm --filter web exec prisma migrate deploy` (requires Postgres up — `./scripts/dev-postgres.sh`). Two new migrations: `0004_purchase_email_index_and_stripe_event_dedupe` and `0005_dashboard_alert_and_code_storage_backend`.
  4. Run gates: `pnpm check:all`; expected to pass given changes are additive + scoped. For coverage: `pnpm --filter web exec vitest run --coverage`.
  5. Resume: wire `DashboardAlert` into `lib/admin-dashboard.ts` + new `dashboard-spike.tsx` component (M7.6 finish, ~1h); public `/repos` index page (~30m); remaining P1 review items (admin JSON size limits, refund flow, README markdown sanitizer fixtures, S3 vault scan Lambda hook).
- **Blocked / external input:** S3 creds (live uploads), Stripe live keys (staging/prod), Vercel DNS for `savigesystemz.com`, `GITHUB_TOKEN` for private-repo sync.

---

- **Timestamp:** 2026-04-22 (night continuation; M7 slice 5 shipped)
- **Status:** M0 remains complete, M5.1–M5.4 is shipped, M1 slices 1+2 plus slice-3 groundwork are landed, and M7 slices 1+2+3+4+5 are complete:
  - M5.1 shipped: `/admin/code` visibility selector (`DRAFT|PRIVATE|PUBLIC`), PATCH schema now supports `visibility`, and audit action `code.repository.visibility`.
  - M5.2 shipped: `POST /api/admin/code/sync-all` (serial sync), audit action `code.repository.sync-all`, and per-row sync feedback in the admin panel.
  - M5.3 shipped: new public `/repos/[slug]` route (PUBLIC-only), GitHub README fetch with 5-minute in-memory cache, and sanitized markdown rendering component.
  - M5.4 shipped: new `POST /api/webhooks/github` endpoint (HMAC validation via Web Crypto, IP rate limit, push-event handling, tracked-repo sync, audit action `code.repository.webhook`).
  - `apps/web/playwright.config.ts` default `DATABASE_URL` fallback updated to Postgres (`postgresql://ssz:dev@localhost:5433/savige`) to match repo cutover.
- **M1 slice 1 shipped:**
- **M1 slice 2 shipped:**
- **M1 slice 3 groundwork shipped:**
  - Added `CommandPaletteRow` primitive to `packages/ui`.
  - Polished `/admin` overview with promoted UI primitives (`Panel`, `SectionHeading`, `StatusChip`) and seeded static command rows to accelerate M7 interactive palette work.
  - Full quality gate still green.
- **M7 prep shipped:**
  - Interactive command palette now mounted in `AdminShell` (`apps/web/components/admin/command-palette.tsx`) with `Cmd/Ctrl+K`, fuzzy filtering, keyboard navigation, and route-jump actions.
  - Added focused E2E: `tests/e2e/admin-command-palette.spec.ts`.
- **M7 slice 1 shipped:**
  - Added server-composed admin intelligence helper: `apps/web/lib/admin-dashboard.ts`.
  - `/admin` now renders computed widgets for launch blockers, repo sync errors, moderation backlog, request backlog, and audit anomaly bursts, plus a ranked "fix next" queue with severity badges and deep links.
  - Added unit coverage: `tests/unit/admin-dashboard.test.ts`.
- **M7 slice 2 shipped:**
  - Added URL-driven timeframe controls on `/admin` (`window=24h|7d`) and focus drill-down state (`focus=launch|repos|moderation|requests|audit`).
  - Expanded `getAdminDashboardSummary` to return drill-down payloads per widget lane (launch blockers, repo sync errors, moderation queue, request queue, anomaly actions).
  - Wired widget actions to in-place drill-down rendering with concrete rows and deep links to the owning admin surfaces.
- **M7 slice 3 shipped:**
  - Added trend snapshots in `apps/web/lib/admin-dashboard.ts` for current vs previous window deltas: repo error inflow, moderation inflow, request inflow, and audit anomaly bursts.
  - `/admin` now surfaces trend deltas directly in widget shortcuts and focused drill-down headers, with severity-aware status chips.
  - Added inline high-friction quick actions in focused drilldowns (`Sync all now`, `Process queue`, `Review bursts`) and expanded unit assertions in `tests/unit/admin-dashboard.test.ts`.
- **M7 slice 4 shipped:**
  - Added focused Playwright coverage in `apps/web/tests/e2e/admin-dashboard.spec.ts` for dashboard focus/window behavior and trend drill-down rendering.
  - Updated fix-next links that target `/admin` to preserve active dashboard context (`window` + `focus=launch`) instead of dropping operators to a generic overview state.
- **M7 slice 5 shipped:**
  - Added freshness telemetry to `/admin` (`last updated` display + URL-driven refresh controls `off|30s`).
  - Added lightweight client refresher (`apps/web/components/admin/auto-refresh.tsx`) that uses `router.refresh()` at a 30s interval when enabled.
  - Extended dashboard summary payload with `generatedAt` and trend spike flags; surfaced `Spike` chips in focused drilldown trend lanes.
  - Expanded admin dashboard E2E to cover refresh controls/freshness rendering.
  - Migrated first three public routes to promoted UI primitives in `@savige/ui` (`applications`, `archive`, `services`) using `Panel`/`SectionHeading`/`StatusChip`.
  - Completed app-wide import migration from `@/components/section-heading` to `@savige/ui` for all current consumers.
  - `pnpm check:all` remains green after migration.
  - Added reduced-motion fallback block in `apps/web/app/globals.css` to disable/neutralize animation-heavy utilities (`drift-*`, `reveal*`, `scanline`, `pulse-glow`, `border-shimmer`).
  - Promoted UI primitives into `packages/ui/src/`: `Panel`, `StatusChip`, and `SectionHeading`.
  - `apps/web/components/section-heading.tsx` now re-exports `SectionHeading` from `@savige/ui`.
  - Added reduced-motion a11y E2E coverage in `apps/web/tests/e2e/a11y.spec.ts`.
- **Validation (latest):**
  - `pnpm --filter web lint` / `typecheck` / `test` green.
  - Playwright `tests/e2e/admin-code.spec.ts` 11/11 green in deterministic mode (`GITHUB_MOCK_MODE=1`).
  - Playwright `tests/e2e/a11y.spec.ts` 14/14 green (includes reduced-motion run).
  - Playwright `tests/e2e/admin-dashboard.spec.ts` 3/3 green (focus/window/refresh coverage).
  - `pnpm check:all` green.
- **Night wrap (2026-04-22):**
  - Local site is live on `http://127.0.0.1:43907` (`pnpm dev:web` running, listener confirmed).
  - Desktop launcher validated and launch-tested: `~/Desktop/SavigeSystemZ-local.desktop` (`desktop-file-validate` clean, `gio launch` ok).
- **Next actionable:** M7 slice 6 — operator alert ergonomics (dismissible spike notices + acknowledgment state) and optional notification fanout hooks.

---

- **Timestamp:** 2026-04-22 (late-afternoon continuation; M0 doc alignment pass shipped after Ultraplan-refined plan approval)
- **Status:** M0 (docs + AI-OS integration) done. No runtime code, no schema, no migrations. Refined per-milestone session prompts now live in `_ai_operating_system/PROMPT_PACK.md` Part II; four new product-doc stubs seeded in `docs/` (UX_SYSTEM, AI_INTEGRATION_STRATEGY, CODE_STORAGE, DEV_ENV_GOTCHAS); SQLite-as-dev-default drift removed from `docs/DATABASE.md`, `README.md`, root `CLAUDE.md`.
- **Latest commit on disk:** `c70ab8c` on `main`. M0 changes are uncommitted working tree pending owner review.
- **Next actionable:** M1 slice 1 — `prefers-reduced-motion` fallback in `apps/web/app/globals.css` + first `packages/ui` primitive promotion. OR quick-win M5.1 — visibility toggle in `/admin/code`. See `PROMPT_PACK.md` Part II.

---

## Earlier pulse (2026-04-22 mid-day)

- **Status:** Application ↔ CodeRepository relation (priority-1 follow-up to M10) shipped end-to-end — schema + migration + admin API + admin UI + public surface + tests. All gates green against Postgres.
- **Latest commit on disk:** uncommitted working tree as of this file being written. Previous session landed `68e2f46` (M10 scaffold). This session's changes are staged for the owner's review / commit.

## Quality gates (this session, against Postgres)

| Gate | Result |
|------|--------|
| Unit tests | **124 / 124** pass (3 new in `tests/unit/code-repository.test.ts` covering `setCodeRepositoryApplicationLinks`) |
| ESLint | clean |
| `tsc --noEmit` | clean (includes fix to `tests/unit/concierge.test.ts` KnowledgeBase fixture for new `codeRepository: null` field) |
| `pnpm build:web` | ✓ Compiled successfully — `/admin/code`, `/applications/[slug]`, `/api/admin/code/[id]` all in the route table |
| Migration `0003_application_code_repository_link` | applied against local Postgres (`postgresql://ssz:dev@localhost:5433/savige`) |
| Desktop launcher | `desktop-file-validate` clean, `gio launch` exit 0, xdg-open routes through Vivaldi |
| Runtime smoke | `/`, `/applications`, `/applications/[slug]`, `/archive`, `/api/catalog`, `/api/health` → 200 |

## What shipped this session

1. **Migration `0003_application_code_repository_link`** — adds `Application.codeRepositoryId` (optional FK, `onDelete: SetNull`) + `@@index([codeRepositoryId])`; adds `applications[]` back-relation on `CodeRepository`. Applied against Postgres.
2. **`lib/code-repository.ts`** — new `setCodeRepositoryApplicationLinks(repoId, applicationIds)` (transactional: unlinks anything no longer in the set, then links the requested ids); new `listApplicationsForLinking()` helper; `listCodeRepositories()` now `include: { applications: {...} }`.
3. **Admin API**:
   - `GET /api/admin/code` now returns `{ items, applications }` so the UI can populate the linker.
   - `PATCH /api/admin/code/[id]` accepts `{ applicationIds: string[] }` (Zod-validated, max 50), writes audit log `code.repository.link`, returns the refreshed repo with linked apps. 404 on missing repo, 400 on bad body, 403 without owner.
4. **Admin UI (`components/admin/code-panel.tsx`)** — per-repo "Link apps" button opens a checkbox editor; existing links rendered as pill list; "currently linked elsewhere" warning when an app is owned by a different repo.
5. **Public surface** — `getPublicApplicationWithReleasesBySlug` now includes `codeRepository`; `/applications/[slug]` renders a "Source code" card (primary language, default branch, stars, open issues, latest commit, GitHub link) **only when the linked repo's visibility is `PUBLIC`**. PRIVATE/DRAFT repos never leak to anonymous visitors.
6. **Tests** — 3 unit tests cover the new lib function (missing-repo error, partial relink keeps only the requested set, empty array clears everything); 4 new E2E cases cover `PATCH` auth, 404, malformed body, and the new `applications` field on `GET`.
7. **Dev-server env fix** — `scripts/dev-web.mjs` used to set `DATABASE_URL: process.env.DATABASE_URL?.trim() || "file:./dev.db"` in the child process, overriding `.env.local` and forcing Prisma into SQLite-protocol validation errors. Removed the override; `.env.local` now drives DATABASE_URL cleanly.
8. **`apps/web/.env.local`** — flipped `DATABASE_URL` from `file:./dev.db` → `postgresql://ssz:dev@localhost:5433/savige` so `pnpm dev:web` works out of the box against the canonical local Postgres container.
9. **`apps/web/AGENTS.md`** — Stack + PR checklist lines updated from SQLite to Postgres; Code module section documents the new `PATCH` route and the `Application.codeRepositoryId` relation.
10. **Desktop launcher** — `Categories=Network;Development;` raised a freedesktop hint (two main categories). Changed to `Categories=Development;WebDevelopment;` in the template and re-installed. Validated with `desktop-file-validate`, `gio info` (metadata::trusted=true), and `gio launch` (exit 0 → Vivaldi → dev server).

## Ready for owner to test

1. Dev server is already running on **http://127.0.0.1:43907/** (background process; kill with `pkill -f "next dev --hostname 127.0.0.1 --port 43907"` if it needs a clean restart).
2. Desktop icon at `~/Desktop/SavigeSystemZ-local.desktop` is trusted, valid, and verified to launch the site.
3. Log in as owner → **`/admin/code`** → connect a repo (or re-use one already tracked) → click **Link apps** → pick which Application(s) should advertise that repo → Save. Audit log records the change at `/admin/audit`.
4. Visit the corresponding public **`/applications/[slug]`** page — the "Source code" card should appear below the Build-stack section (only if the repo's visibility is `PUBLIC` in the admin panel).

## What should be done next (ordered by leverage)

| # | Item | Why | Effort |
|---|------|-----|--------|
| 1 | Visibility toggle UI in `/admin/code` | Repo visibility currently only flippable via DB / API; owner should be able to flip DRAFT ↔ PUBLIC from the panel so the public "Source code" card can actually appear without a DB poke | S |
| 2 | Public `/repos/[slug]` detail page (README render for PUBLIC repos) | Closes the "displays code works" loop for code-heavy projects | M |
| 3 | "Sync all" batch action | Avoid clicking Sync per-row once several repos are tracked | S |
| 4 | GitHub webhook intake (`/api/webhooks/github`, HMAC-verified) | Auto-sync on push; removes the manual Sync click | M |
| 5 | E2E happy-path test with stubbed GitHub API | Lock in connect-success behavior without live-GitHub flake in CI | S |
| 6 | Owner manual round-trip on `/admin/code` | Verify the UX in-browser against a real GitHub repo the owner actually owns | S |

## What could be done (opportunistic / later)

- **M11 self-hosted storage:** Gitea sidecar vs. S3-mirrored bare-repo — capture decision in `docs/CODE_STORAGE.md`.
- **Dependency / SBOM surfacing** per tracked repo.
- **Code search** across all tracked repos (trigram / Tantivy).
- **Release tagging:** link GitHub Releases → existing `ApplicationVersion` / `ReleaseAsset` pipeline.
- **Contributors view:** pull `GET /repos/:owner/:repo/contributors` into a bio surface.

## Blocked — needs external input (unchanged)

| Item | What's needed |
|------|---------------|
| Owner S3 uploads | AWS creds + bucket |
| Live Stripe staging | `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` |
| Domain routing | Vercel DNS attach for `savigesystemz.com` |
| S3 vault scan Lambda deploy | AWS Lambda deploy access |
| Private-repo sync on `/admin/code` | Populate `GITHUB_TOKEN` in `apps/web/.env.local` |

## Intentionally uncommitted (pre-session working-tree changes, unchanged from last handoff)

Review at your pace:
- `.gitignore`, `apps/web/app/(public)/applications/page.tsx`, `apps/web/app/(public)/page.tsx`, `apps/web/app/globals.css`, `apps/web/app/layout.tsx`
- Untracked: `.ai/` (AIAST-style scratch), `.cursor/rules/00-ai-context.mdc`, `.github/copilot-instructions.md`, `GEMINI.md`

## Full recall

`SESSION_RECALL.md` — full done/not-done checklist.

## Handoff to next session

1. Read this file + `SESSION_RECALL.md` + `TODO.md` (in that order).
2. Check Postgres is up: `docker compose -f docker-compose.postgres.yml ps` (expect `Up (healthy)` on port 5433).
3. Check dev server is or is not running: `ss -tln | grep 43907`. If not, `pnpm dev:web` (cwd = repo root).
4. Check desktop launcher: `desktop-file-validate ~/Desktop/SavigeSystemZ-local.desktop` → no output = good.
5. Pick from the "What should be done next" table. Item #1 (visibility toggle) is the highest-leverage next step — it unlocks the public "Source code" card without the owner needing to poke the DB.
