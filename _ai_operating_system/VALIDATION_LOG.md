# Validation Log

Records the outcome of `pnpm check:all` and system coherence checks at key milestones.

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
