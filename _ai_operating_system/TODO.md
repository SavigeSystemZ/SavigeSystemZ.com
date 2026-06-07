# TODO — SavigeSystemZ.com

Cross-check **`SESSION_RECALL.md`** and **`WHERE_LEFT_OFF.md`** so nothing is dropped.

## P0 — launch and owner flow

- [x] **Archive launch composer:** guided draft-to-launch flow for archive entries (API + UI).
- [x] **Creator draft handoff:** dual deep links ("Edit draft" + "Launch composer") from moderation panel.
- [x] **Canonical dev port + desktop launcher:** port 43907 wired into `dev-web.mjs`; desktop icon no longer conflicts with the Immortality app.
- [x] **Code module scaffold:** `CodeRepository` model + migration `0002_code_repository`, GitHub client, admin /code page and API routes, admin nav link, `GITHUB_TOKEN` env.
- [x] **Apply Code migration:** applied against Postgres; `/admin/code` routes live in the build.
- [x] **Code module tests:** 10 unit tests (`tests/unit/code-repository.test.ts` + `tests/unit/github-client.test.ts`), 6 E2E (`tests/e2e/admin-code.spec.ts`). All green.
- [ ] **Owner uploads live:** configure real S3 buckets/credentials and verify direct upload from release/media/launch composer surfaces (`pnpm staging:verify -- --probe-http --probe-presign`).
- [x] **Make GitHub repo public:** SavigeSystemZ org repos are public; `pnpm code:sync-org` imported 52 into the site DB.
- [x] **Catalog integrity gate:** `pnpm code:verify-catalog` (52/52); CI quality + E2E run bootstrap + verify with `GITHUB_MOCK_MODE=1`.
- [x] **Catalog UI unification:** `ApplicationPreviewImage`, search/filter, home runway, enrichment panel, manual screenshot tier.
- [x] **Staging operator probes:** `pnpm staging:verify` + HTTP/presign flags; `/admin/launch` catalog completeness gate.
- [x] **Land tooling:** `scripts/land-catalog-completion.sh`, `scripts/verify-release.sh`, `docs/CATALOG_OPERATIONS.md`.
- [x] **Manual /admin/code round-trip:** bulk bootstrap covers org sync; admin UI remains for one-offs.
- [x] **Flagship catalog bootstrap:** `pnpm code:bootstrap` seeds apps, GitHub repo links, v0.1.0 releases, media, and source archives.
- [x] **M7 slice 6 — dismissible spike notices + ack state:** `lib/admin-dashboard.ts` records spike alerts; `components/admin/dashboard-spike-notices.tsx` renders dismissible cards on `/admin`; ack route exists at `/api/admin/dashboard/acknowledge` with rate limit + audit log.
- [x] **Public `/repos` index page:** ranks PUBLIC code repositories by latest commit; links to existing `/repos/[slug]` detail page.
- [x] **Admin JSON size limits sweep:** all admin POST/PATCH JSON routes now use `readJsonBody` with per-route caps (8 KB → 256 KB).
- [x] **README sanitizer hardening:** mixed-case + multiline `<script>` tags, single-quoted/unquoted event handlers, non-http(s) protocols all rejected; fixtures in `tests/unit/markdown-render.test.ts`.
- [x] **Stripe REFUNDED status:** add `REFUNDED` to `PurchaseStatus` enum + migration; wire `POST /api/admin/purchases/[id]/refund` calling Stripe `refunds.create` + audit log.
- [x] **Checkout transaction wrap:** `lib/checkout-complete.ts` license-grant + purchase-update should be a single `db.$transaction` to avoid the License-granted-but-Purchase-not-completed window.
- [x] **GitHub README rate-limit + sync debounce:** `lib/github-client.ts` README fetcher + per-repo sync should debounce to prevent burst calls.
- [x] **Audit-log retention:** delete or archive `AuditLog` rows older than 90 days (cron or pg_partman).
- [x] **E2E coverage gaps:** `/repos` index, spike-notice dismiss flow, admin publish flows.
- [ ] **S3 vault scan Lambda:** wire `infra/s3-vault-scan-lambda/` to vault bucket S3 events for AV/YARA scanning (blocked: AWS deploy access).

## P1 — product quality and coverage

- [x] **Playwright:** archive launch composer (8 tests), creator moderation + promotion (5 tests), expanded commerce (7 tests), a11y (13 routes). Full suite: 50 passed, 0 failed.
- [x] **A11y / polish:** fixed WCAG select-name/input-name violations on archive, creator form, and application manager. 13 axe routes all green.
- [ ] **Commerce:** live-path Stripe staging smoke and follow-up dashboard/download verification (needs `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`).
- [x] **Code module tests:** 10 unit tests + 6 E2E tests — green.
- [x] **`Application` ↔ `CodeRepository` relation** (migration `0003`, admin linker UI, `/applications/[slug]` surfaces a PUBLIC-only "Source code" card — 2026-04-22).
- [x] **M0 doc alignment (2026-04-22):** Postgres-first framing across `docs/DATABASE.md`, `README.md`, `CLAUDE.md`; new stubs `docs/UX_SYSTEM.md`, `docs/AI_INTEGRATION_STRATEGY.md`, `docs/CODE_STORAGE.md`, `docs/DEV_ENV_GOTCHAS.md`; `PROMPT_PACK.md` Part II refined session prompts integrated.
- [x] **M1 slice 1:** `prefers-reduced-motion` fallback in `apps/web/app/globals.css` + first `packages/ui` primitive promotion (`Panel`, `StatusChip`, promoted `SectionHeading`) + reduced-motion a11y E2E checks.
- [x] **M1 slice 2:** adopted promoted UI primitives in key public routes (`applications`, `archive`, `services`) and completed repo-wide `SectionHeading` import migration to `@savige/ui`.
- [x] **M1 slice 3 groundwork:** admin overview card polish + command-palette row primitive landed (`packages/ui/src/CommandPaletteRow.tsx`) and applied on `/admin`.
- [x] **M7 prep:** interactive command palette client component landed in admin shell (`Cmd/Ctrl+K`, search, keyboard navigation, route actions) with Playwright coverage.
- [x] **M7 slice 1:** server-computed "fix next" queue + dashboard widgets landed on `/admin` (`launch blockers`, `repo sync errors`, `pending moderation`, `pending requests`, `recent audit anomalies`) via `lib/admin-dashboard.ts`.
- [x] **M7 slice 2:** interactive widget drill-downs + lightweight timeframe controls (24h/7d) are live on `/admin` with server-backed queue details.
- [x] **M7 slice 3:** queue trend snapshots (current vs previous window deltas) and inline quick actions shipped across admin drill-down lanes.
- [x] **M7 slice 4:** admin dashboard E2E coverage landed for window/focus trend rendering; fix-next `/admin` deep links now preserve dashboard window+focus context.
- [x] **M7 slice 5:** dashboard freshness telemetry (`last updated` + optional `30s` auto-refresh) and trend-threshold spike highlighting shipped on `/admin`.
- [~] **M7 slice 6 — operator alert ergonomics (in progress, 2026-04-27):** schema (`DashboardAlert` model + migration `0005`) and `POST /api/admin/dashboard/acknowledge` route landed; component (`components/admin/dashboard-spike.tsx`) and wiring into `lib/admin-dashboard.ts` deferred — those source files were root-owned at session time and could not be edited until `sudo chown -R whyte:whyte` runs. Resume by reading `lib/admin-dashboard.ts`, adding alert-emission on spike trends, then a `<DashboardSpike>` component that renders dismissible pills calling the acknowledge route.
- [ ] **Code module polish (execution-ready, see `PROMPT_PACK.md` Part II):**
  - [x] **M5.1** — Visibility toggle in `/admin/code` (done: PATCH supports `visibility`, UI select, `code.repository.visibility` audit)
  - [x] **M5.2** — "Sync all" batch action (done: `/api/admin/code/sync-all`, serial sync, `code.repository.sync-all` audit, UI status feedback)
  - [x] **M5.3** — Public `/repos/[slug]` detail page (done: PUBLIC-only resolver, cached README fetch, sanitized markdown render, app-detail link)
  - [x] **M5.4** — GitHub webhook receiver (`/api/webhooks/github`) with HMAC → auto-sync on push
  - [x] E2E happy-path test stubbing GitHub API for deterministic CI (admin code flow now covers connect, visibility, sync-all, webhook push using `GITHUB_MOCK_MODE=1`)

## P2 — production path

- [x] **Postgres:** switched to `postgresql` provider, baseline migration, CI jobs with Postgres service, `scripts/dev-postgres.sh` + `scripts/dev-sqlite.sh` for local dev. Full E2E (56 tests) verified against Docker Postgres.
- [x] **S3 vault scan:** ClamAV-based Lambda with download → scan → tag → quarantine → SNS notify flow. Ready for deploy with ClamAV Lambda layer.
- [x] **CI:** quality + E2E jobs both run against Postgres service containers.
- [x] **Redis elsewhere:** if horizontally scaled, reuse sliding-window pattern for `lib/auth-rate-limit.ts` and `app/api/project-requests/route.ts` (see `docs/RATE_LIMITS.md`).
- [x] **Strict Redis ops:** alerts when `vaultMutationRedis` probe is `error` or 503 rate spikes with `VAULT_REDIS_STRICT=1`.

## P3 — M11 self-hosted code storage (new milestone)

- [x] **Schema stub (2026-04-27):** `CodeRepositoryStorageBackend` enum (`GITHUB | SELF_HOSTED`) + `CodeRepository.storageBackend` column with `GITHUB` default in migration `0005_dashboard_alert_and_code_storage_backend`. Avoids a future migration ordering churn when self-hosted backend lands.
- [x] **Backend decision:** evaluate Gitea sidecar container vs. `isomorphic-git` over S3 bare-repo approach. Capture trade-offs in `docs/CODE_STORAGE.md`.
- [x] **Git hosting surface:** public `GET /repos/<slug>` detail page (README render, tree/blob browser), owner-only `POST /api/admin/code/<id>/sync-contents` to cache selected files.
- [x] **Access control:** extend `AssetVisibility` reuse for code blobs, wire entitlements for PRIVATE repos.
- [x] **Webhook intake (M5.4):** `POST /api/webhooks/github` with HMAC verification + auto-sync on push events.

## P0 — landed this session (2026-04-27, uncommitted, blocked on chown)

- [x] **Codebase audit:** `_ai_operating_system/REVIEW_2026-04.md` — 68 findings (12 P0 / 40 P1 / 16 P2) with `file:line` citations.
- [x] **Cursor rules refresh + master rule:** `.cursor/rules/{00-ai-context,ssz-01-monorepo,ssz-02-apps-web,ssz-03-prisma,ssz-04-security-web}.mdc` rewritten; `ssz-05-agent-execution.mdc` added with execution discipline + hard "do not" list.
- [x] **Claude memory mirroring:** `~/.claude/projects/-home-whyte--MyAppZ-SavigeSystemZ-com/memory/{feedback_execution_discipline.md,reference_architecture_invariants.md}` — future Claude sessions auto-load the same standards.
- [x] **P0 review fixes:** `force-dynamic` on 8 admin pages; Stripe webhook idempotency (`StripeWebhookEvent` model + `claimStripeWebhookEvent` + dedupe); `Purchase.purchaserEmail` index; `OWNER_LOGIN_SECRET` startup guard in `lib/auth.ts`; vault rate-limit per-user scope.
- [x] **M9 launch readiness page:** `app/(admin)/admin/launch/page.tsx` reading new `evaluateProductionLaunchReadiness()` env helper; gates a "Go live" affordance until 11 required env keys are set + ≥ minimum strength.
- [x] **Workstream B — packaged launcher:** rewritten `installer/packaging/appimage/AppRun` (single-instance flock, `/dev/tcp` probe, repo resolution, browser open, server tear-down trap); new AppImage `.desktop`; filled `installer/packaging/deb/{control,postinst,prerm}`; real `installer/scripts/build-packages.sh` (AppDir + dpkg-deb + SHA256SUMS); `installer/scripts/validate-install.sh --appimage` smoke test; `installer/desktop/install-desktop-launcher.sh --smart` and `--package` modes; `.github/workflows/packaging.yml` builds on tag push and attaches to GitHub Release.
- [x] **Workstream C foundations:** `next.config.ts` (AVIF/WebP, remote patterns, `@next/bundle-analyzer` behind `ANALYZE=1`); `vitest.config.ts` (V8 coverage, soft 60% thresholds); `playwright.config.ts` (screenshot + video on failure, GitHub reporter under CI); `app/error.tsx` corrected to nested-boundary; new `app/global-error.tsx`; `lighthouserc.json` (perf ≥ 0.9, a11y ≥ 0.95, CLS ≤ 0.05).
- [x] **P1 review fixes:** S3 presign TTL cap; release-presign content-type allow-list; `randomUUID()` mock checkout id; admin code rate limits (PATCH 60 / sync 12 / DELETE 30 per min); Stripe `checkout.session.expired` + `payment_intent.payment_failed` handlers; `lib/json-body.ts` size-capped reader adopted by versions + release-assets routes.
- [x] **Operator tooling:** `scripts/post-chown-verify.sh` — single-command verify after the user runs `sudo chown`. Ownership sweep → `git fsck` → Postgres up → `prisma migrate deploy` → `pnpm check:all` → dev boot → `/api/health`. Bails on first failure with the next step. `scripts/post-chown-commit.sh` — staged commit script that breaks the uncommitted work into 7 logical commits.

## Pending after chown (resume order)

- [x] 1. Run `./scripts/post-chown-verify.sh` end-to-end.
- [x] 2. Run `./scripts/post-chown-commit.sh` to land the work in 7 commits.
- [x] 3. Wire `DashboardAlert` into `lib/admin-dashboard.ts` and create `components/admin/dashboard-spike-notices.tsx` (M7.6 finish).
- [x] 4. Create `app/(public)/repos/page.tsx` (public repo index).
- [x] 5. Triage the remaining 40 P1 + 16 P2 review items (refund flow, AI per-user rate limit + audit, Application JSON-blob field typing, soft-delete utility, License/Purchase transaction wrap, README markdown sanitizer fixtures).

## Done (archive reference)

- [x] Public catalog API + seed wiring; mock commerce E2E.
- [x] Cursor/agent ergonomics (`.cursor/rules`, `AGENTS.md`, `.vscode` optional).
- [x] AI agent system audit, buildout, session changelog (16 coherence fixes, PATTERNS.md, TROUBLESHOOTING.md, root CLAUDE.md).
- [x] Git remote + push to GitHub (SavigeSystemZ/SavigeSystemZ.com, private).
- [x] Archive launch composer (guided draft-to-publish) and creator-to-launch handoff (deep links).
- [x] Vault crypto, legacy key, Redis limiter, strict mode, reencrypt script, health probes.
- [x] Starter S3 Lambda folder + dev compose bundle.
- [x] Flagship public redesign, application catalog/detail routes, archive system, creator intake/moderation/promotion, media galleries, launch readiness, publish flows, and guided application launch composer.
