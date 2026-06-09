# Validation Log

Records the outcome of `pnpm check:all` and system coherence checks at key milestones.

## 2026-06-09 — P0 delivery + Friction removal + screenshot collection

### Final state
- **HEAD:** `85ce506` — `main` synced with `origin/main`, working tree clean
- **Commits:** `9f64c54` (P0 delivery), `4fb7bf1` (handoff), `85ce506` (Friction + screenshots)

### Code quality gates (`pnpm check:all`)
- **Lint**: PASS
- **Typecheck**: PASS
- **Vitest**: PASS (**187 / 187**)
- **Build**: PASS

### Files changed
- Resume page + contact form + S3 + Postgres guides
- Friction app visibility control scripts
- 58 screenshot files from 22 local app repos
- 63 files changed, 534 insertions

### Validation
- Full test suite green (187 unit tests)
- All routes compile successfully
- 2 new commits committed and pushed

---

## 2026-06-07 — Session wrap (CI green, tree clean)

### Final state
- **HEAD:** `621ac96` — `main` synced with `origin/main`, working tree clean
- **GitHub Actions:** quality ✅ · e2e ✅ · lighthouse ✅ (after lockfile, owner-secret, turbo passthrough, webhook casing fixes)

### Commits pushed this session (high level)
- Catalog land batch (`fe3b0a4`…`89db0b0`) + CI ui-catalog gate + launch discovery + showcase refresh
- CI/deps: `pnpm-lock.yaml` tracked, frozen installs, PharmPhreak registry
- Fixes: `OWNER_LOGIN_SECRET` at build, `turbo.json` env passthrough, case-insensitive webhook sync

### Local gates (last run)
- **`pnpm verify:release`**: PASS
- **E2E** (`E2E_PORT=43907`): **86 passed / 1 skipped**

---

## 2026-06-07 — Push + showcase refresh + CI lockfile fix

### Operator moves executed
- `pnpm code:discover-launches` — 5 live / 19 with URL / 52 total
- `pnpm code:capture-ui-screenshots -- --apps-only --allow-partial` — 5 manual UI captures (incl. PharmPhreak)
- `pnpm code:seed-releases` — 104 media rows updated
- `git push origin main` — 11 commits through `9fd8483`

### Local validation
- **`pnpm verify:release`**: PASS (180 Vitest, 52/52 ui-catalog)
- **E2E** (`E2E_PORT=43907`, owner secrets from `.env.local`): **86 passed / 1 skipped**

### CI follow-up
- First push failed: `pnpm-lock.yaml` was gitignored → tracked lockfile + `--frozen-lockfile` in workflows
- `stripe-webhook-smoke.yml`: removed invalid job-level `secrets` conditional

---

## 2026-06-07 — Land batch committed (8 commits on main)

### Commits
- `fe3b0a4` feat(catalog): 52-repo verify pipeline + bootstrap scripts
- `18f8cc2` feat(catalog): preview media, search, runway, showcase tiers + 52 ui-catalog PNGs
- `2225d89` feat(commerce): donate lane + commerce panel
- `7c89cb4` feat(admin): staging probes + catalog screenshot promotion
- `0adb8e5` ci: bootstrap catalog verify + Lighthouse URLs
- `e1007d9` test(e2e): catalog coverage + rate-limit stability
- `a496968` docs: CATALOG_OPERATIONS + handoff
- `89db0b0` chore: verify-release + land-catalog-completion.sh

### Post-commit verify
- **`pnpm verify:release`**: PASS (180 Vitest, 52/52 ui-catalog gate)

---

## 2026-06-07 — Presign probes + full E2E validation

### Code quality gates (`pnpm check:all`)
- **Lint**: PASS
- **Typecheck**: PASS
- **Vitest**: PASS (**173 / 173**)
- **Build**: PASS

### Catalog + E2E
- **`pnpm code:verify-catalog`**: 52/52 OK (Postgres localhost:5433)
- **Playwright (reuse dev server 43907)**: **86 passed**, 1 skipped (`stripe-webhook-signed`), 0 failed
- **Fix**: `critical.spec.ts` home smoke uses `SavigeSystemZ home` + `Explore the catalog` (catalog runway added duplicate `SavigeSystemZ` link matches)

### Operator tooling
- **`pnpm staging:verify -- --probe-http --probe-presign`**: HTTP + presign route probes (exit 1 until Stripe/S3 env configured — expected locally)

---

## 2026-06-07 — Staging readiness + home runway + CI hardening

### Code quality gates (`pnpm check:all`)
- **Lint**: PASS
- **Typecheck**: PASS
- **Vitest**: PASS (**170 / 170**)
- **Build**: PASS

### Catalog + E2E
- **`pnpm code:verify-catalog`**: 52/52 OK (Postgres localhost:5433)
- **Playwright**: catalog-coverage (52 HTTP + 5 browser samples) + flagship-catalog 4/4 pass against live dev server on 43907

### Operator tooling
- **`pnpm verify:release`**: `check:all` + `code:verify-catalog`
- **`scripts/land-catalog-completion.sh`**: 8 themed commits for the completion-plan diff
- **`docs/CATALOG_OPERATIONS.md`**: bootstrap, verify, staging probes, E2E

---

## 2026-06-07 — World-Class Site Completion Plan (all phases)

### Code quality gates (`pnpm check:all`)
- **Lint**: PASS
- **Typecheck**: PASS
- **Vitest**: PASS (**167 / 167**)
- **Build**: PASS

### Catalog integrity
- **`pnpm code:verify-catalog`**: validates repos → apps → media → v0.1.0 releases
- **CI E2E**: `GITHUB_MOCK_MODE=1 pnpm code:bootstrap && pnpm code:verify-catalog` before Playwright
- **Mock screenshots**: placeholder PNGs written in mock mode for CI stability
- **Sitemap**: `/repos`, `/downloads`, dynamic `/repos/[slug]` + `/applications/[slug]`

### UI + enrichment
- **`ApplicationPreviewImage`**: unified next/image on downloads, archive cards/detail
- **`catalog-enrichment.ts`**: GitHub metadata + README excerpt on detail pages
- **Admin**: `POST /api/admin/application-media/[id]/set-catalog-screenshot`
- **Catalog search/filter** on `/applications`

### CI additions
- **`catalog-coverage.spec.ts`**: smoke all catalog slugs (commerce + image)
- **Lighthouse job**: `@lhci/cli` on home, applications, detail, downloads, repos
- **A11y**: ledgerloop + vetraxis detail routes added

### Staging blockers (operator)
- Stripe test keys + webhook secret
- AWS S3 media/release buckets + `AWS_S3_PRESIGN_ENABLED=1`

---

## 2026-06-07 — GitHub Sponsors donate + repository screenshots

### Code quality gates (`pnpm check:all`)
- **Lint**: PASS
- **Typecheck**: PASS
- **Vitest**: PASS (**157 / 157**)
- **Build**: PASS

### Screenshot + media pipeline
- **`pnpm code:fetch-screenshots`**: 52/52 downloaded to `public/showcase/screenshots/`
- **`pnpm code:seed-releases`**: 52 media created, 52 media updated (hero SVG + repository preview JPG)
- Live verify: `/applications/immortality` shows `showcase/screenshots/immortality`, GitHub Sponsors link, donate checkout

### E2E
- **Flagship catalog**: 4/4 pass (GitHub Sponsors + Download/Purchase/Donate panel)

---

## 2026-06-07 — GitHub org mirror + flagship bootstrap + full E2E green

### Code quality gates (`pnpm check:all`)
- **Lint**: PASS
- **Typecheck**: PASS
- **Vitest**: PASS (**146 / 146**)
- **Build**: PASS

### E2E (`DATABASE_URL=postgresql://ssz:dev@localhost:5433/savige E2E_PORT=43907 GITHUB_MOCK_MODE=1`)
- **Playwright**: **80 passed**, 1 skipped (`stripe-webhook-signed` — no Stripe secrets)
- **Flagship catalog**: 4/4 pass (`flagship-catalog.spec.ts`)
- **Fixes**: API session helper for owner login; admin publish form scoping; repos upsert seed; webhook repo casing; dev auth rate limit

### Data bootstrap (`pnpm code:bootstrap`)
- **CodeRepository (PUBLIC)**: 52 org repos
- **Application**: 12 flagship apps linked to repos
- **ApplicationVersion / Media / ReleaseAsset**: 12 versions, 12 media, 15 assets

### Runtime
- Dev server: `http://127.0.0.1:43907/`
- Postgres: `localhost:5433/savige` healthy

---

## 2026-04-29 — ownership unblocked + M7 slice 6 + /repos index + admin JSON size sweep

### Code quality gates (`pnpm check:all`)
- **Lint**: PASS
- **Typecheck**: PASS
- **Vitest**: PASS (**138 / 138**, 25 test files)
- **Build**: PASS (turbo: 5 cached, 1 live; 8.13s total)

### Focused verification
- **Ownership sweep**: `find . -path ./node_modules -prune -o -not -user whyte -print` → 0 results (was 529).
- **Migrations applied**: `0004_purchase_email_index_and_stripe_event_dedupe` and `0005_dashboard_alert_and_code_storage_backend` applied cleanly to local Postgres on `localhost:5433/savige`.
- **Site live**: `curl http://127.0.0.1:43907/api/health` → `{ok:true,service:"savigesystemz-web",vaultMutationRateLimit:"memory"}`.
- **Public /repos index**: HTTP 200 (no public repos seeded — empty-state copy renders).
- **Smart desktop launcher**: `desktop-file-validate ~/Desktop/SavigeSystemZ-local.desktop` → exit 0; `Exec=` line points to `installer/packaging/appimage/AppRun` so cold clicks now boot the dev server.

### Files touched (uncommitted working tree)
- `apps/web/app/error.tsx` — `<a>` → `<Link>` for `/`.
- `apps/web/lib/admin-dashboard.ts` — `recordSpikeAlerts` + `listActiveDashboardAlerts` + `activeAlerts` on summary.
- `apps/web/components/admin/dashboard-spike-notices.tsx` — new client component.
- `apps/web/app/(admin)/admin/page.tsx` — mount notices.
- `apps/web/app/(public)/repos/page.tsx` — new public index.
- `apps/web/lib/catalog-resolver.ts` — `listPublicRepos()` helper.
- `apps/web/components/markdown-render.tsx` — sanitizer regex hardening.
- `apps/web/tests/unit/markdown-render.test.ts` — 4 new fixtures.
- `apps/web/tests/unit/admin-dashboard.test.ts` — DashboardAlert mocks + 1 new test.
- `apps/web/tests/unit/stripe-webhook-processor.test.ts` — `@/lib/db` mock.
- 18 admin POST/PATCH routes — adopt `readJsonBody` + per-route MAX_BODY_BYTES.

---

## 2026-04-22 — M7 dashboard intelligence slices 1-5 + night operational wrap

### Code quality gates (`pnpm check:all`)
- **Lint**: PASS
- **Typecheck**: PASS
- **Vitest**: PASS (**133 / 133**)
- **Build**: PASS (`next build` route table includes `/admin`, `/admin/code`, `/repos/[slug]`, webhook/admin APIs)

### Focused verification
- **Admin dashboard E2E**: PASS (`tests/e2e/admin-dashboard.spec.ts` **3 / 3**)
  - Focus persists when switching timeframe
  - Audit drilldown + trend lane renders
  - Refresh controls + freshness telemetry render
- **Runtime smoke (live)**:
  - `GET http://127.0.0.1:43907/` → **200**
  - Listener confirmed on `127.0.0.1:43907`
- **Desktop launcher**:
  - `~/Desktop/SavigeSystemZ-local.desktop` exists
  - `desktop-file-validate` → clean
  - `gio launch ~/Desktop/SavigeSystemZ-local.desktop` → launches URL path

### Notes
- A stale Next dev PID caused one Playwright webServer startup conflict; process was terminated and rerun succeeded.
- End-of-night state intentionally left with dev server running on canonical local URL for immediate launch from desktop icon.

## 2026-04-22 — Application ↔ CodeRepository link (migration 0003) + dev-server env fix

### Code quality gates (`pnpm check:all`)
- **Lint**: PASS (6 tasks clean)
- **Typecheck**: PASS (7 packages clean — includes fix to `tests/unit/concierge.test.ts` KnowledgeBase fixture)
- **Vitest**: **124 / 124** pass (20 files) — 3 new tests in `tests/unit/code-repository.test.ts` covering `setCodeRepositoryApplicationLinks`
- **`pnpm build:web`**: PASS — `/admin/code` routes + updated `/applications/[slug]` compile; Prisma client regenerated post-migration
- **Prisma migrate deploy**: applied `0003_application_code_repository_link` against local Postgres (`postgresql://ssz:dev@localhost:5433/savige`)

### Runtime smoke (live against Postgres, port 43907)
- `GET /` → 200
- `GET /applications` → 200
- `GET /applications/wireless-ops-suite` → 200 (detail page reached)
- `GET /archive` → 200
- `GET /api/catalog` → 200 (returns real Postgres row `cmnnteez70000i2kop620vq9d`, not static fallback)
- `GET /api/health` → 200 (`vaultMutationRateLimit: memory`)
- **Desktop launcher**: `desktop-file-validate` clean (no hints after `Categories` fix); `gio launch ~/Desktop/SavigeSystemZ-local.desktop` → exit 0; `xdg-open http://127.0.0.1:43907/` routed through Vivaldi (default handler)

### Issues found and resolved this session (3)
1. `scripts/dev-web.mjs` hard-coded `DATABASE_URL: process.env.DATABASE_URL?.trim() || "file:./dev.db"` in the child-process env, overriding `.env.local` and triggering Prisma "URL must start with the protocol `postgresql://`" on every dev session. Removed the override — `.env.local` + Next's `.env` loader now drive it correctly.
2. `apps/web/.env.local` still carried the SQLite URL from the SQLite era. Flipped to `postgresql://ssz:dev@localhost:5433/savige` so `pnpm dev:web` works against the canonical local Postgres without needing `dev-postgres.sh`.
3. `apps/web/AGENTS.md` still claimed SQLite as the local store. Updated the Stack + PR checklist lines to Postgres.
4. Desktop launcher `Categories=Network;Development;` raised a freedesktop hint (two main categories). Changed to `Categories=Development;WebDevelopment;` in `installer/desktop/SavigeSystemZ-local.desktop.in` and re-installed.

### New / changed surfaces
- **Schema**: `Application.codeRepositoryId` (optional FK, `onDelete: SetNull`) + `@@index([codeRepositoryId])`; `CodeRepository.applications[]` back-relation
- **Admin API**: `PATCH /api/admin/code/[id]` with Zod-validated `{ applicationIds: string[] }`; `GET /api/admin/code` now returns `{ items, applications }` for the linking UI
- **Admin UI**: new "Link apps" button + checkbox editor + "Linked applications" pill list per repo in `components/admin/code-panel.tsx`
- **Public UI**: `codeRepository` included on `getPublicApplicationWithReleasesBySlug`; `/applications/[slug]` renders a "Source code" card (lang, branch, stars, open issues, latest commit, GitHub link) when the linked repo is `PUBLIC`. Non-public repos never leak to anonymous visitors.
- **E2E**: 4 new cases in `tests/e2e/admin-code.spec.ts` covering PATCH auth, 404, body validation, and `applications` on list.

## 2026-04-06 — AI system audit, buildout, and full validation

### Code quality gates
- **`pnpm --filter web lint`**: PASS (clean)
- **`pnpm --filter web typecheck`**: PASS (clean)
- **`pnpm --filter web test`**: PASS (17 test files, 96 tests, 0 failures)
- **`pnpm build:web`**: PASS (all routes compile)
- **Prisma generate**: PASS
- **Prisma migrate deploy**: PASS (9 migrations applied, none pending)

### System coherence checks
- **AI system files exist**: 23/23 files present
- **File reference audit**: 66/66 lib/doc file references valid, 23/23 directory references valid
- **Cross-reference: proxy.ts rule**: 6/6 sources aligned
- **Cross-reference: no-header-trust rule**: 6/6 sources aligned
- **Cross-reference: migration-over-push rule**: 7/7 sources aligned
- **No forbidden middleware.ts**: PASS (none found)
- **Timestamp alignment**: WHERE_LEFT_OFF and SESSION_RECALL both 2026-04-06
- **All lib/* in CLAUDE.md exist**: 19/19
- **All docs/* in CLAUDE.md exist**: 14/14
- **Memory files intact**: 5/5
- **No orphan _ai_operating_system files**: 11/11 referenced in README (excluding README itself)

### Issues found and resolved (16 total)
1. CONTRIBUTING.md lenient on db push → aligned with migration-first
2. SESSION_RECALL timestamp stale → updated to 2026-04-06
3. modules/ role undocumented → added to CLAUDE.md layout
4. PROMPT_PACK.md skeletal → built out with full M0-M9 scope/verification
5. RISK_REGISTER.md generic → replaced with 9 specific active risks
6. TEST_STRATEGY.md not actionable → rebuilt with layers, commands, gaps, when-to-test
7. VALIDATION_LOG.md stale → replaced with current validation results
8. PLAN.md vague → rebuilt with active items, constraints, blocked items, decision log
9. Root CLAUDE.md missing CONTRIBUTING reference → added
10. Root CLAUDE.md missing .cursor rule awareness → added AI system file map
11. Project CLAUDE.md missing docs/ index → added full documentation table
12. No bidirectional links between CLAUDE.md and AGENTS.md → added
13. apps/web/AGENTS.md didn't mention CLAUDE.md → linked via @AGENTS.md
14. _ai_operating_system/README.md sparse → rebuilt with full directory index + companion files
15. No CLAUDE.md mentions memory system → added to project CLAUDE.md
16. VISION_AND_ROADMAP.md misaligned with TODO → rebuilt aligned with P0/P1/P2

### New files created
- `_ai_operating_system/PATTERNS.md` — canonical code patterns (135 lines)
- `_ai_operating_system/TROUBLESHOOTING.md` — common issues and solutions (84 lines)

## 2026-04-02 — Scaffold validation

- Scaffold validation pending dependency installation (superseded by above).
