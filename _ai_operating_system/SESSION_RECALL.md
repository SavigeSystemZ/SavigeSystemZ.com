# Session recall — do not skip

Use this file when resuming work so nothing is skimmed or forgotten. **`WHERE_LEFT_OFF.md`** stays the short pulse; this is the **checklist depth**.

## Done and verified (recent)

- **M11 Self-Hosted Code Storage (2026-05-31):** Added native Node.js to `git-http-backend` integration bypassing the need for sidecar containers. Enabled smart-HTTP `git clone`/`push` directly against Next.js. `db.license` entitlements now securely gate `PRIVATE` repos so entitled users can fetch code. Public Tree/Blob Viewer built natively over `git ls-tree` and `git show` without duplicating blob storage to Postgres. Admin Code UI gained an "Init Self-Host" button that handles `git init --bare` automatically.
- **M7 dashboard intelligence slices 1-5 + night wrap (2026-04-22, late):** `/admin` now has server-ranked fix-next queue, drilldowns (`focus`), timeframe controls (`window=24h|7d`), trend deltas versus prior window, inline quick actions, spike highlighting, freshness telemetry (`last updated`), and optional auto-refresh (`refresh=off|30s`). Coverage added in `tests/unit/admin-dashboard.test.ts` and `tests/e2e/admin-dashboard.spec.ts` (3 passing). End-of-night operational check completed: local app responds `200` at `http://127.0.0.1:43907`, dev server running, desktop launcher `~/Desktop/SavigeSystemZ-local.desktop` validated and launch-tested.
- **Application ↔ CodeRepository link + dev-env fix (2026-04-22, mid-day continuation):** migration `0003_application_code_repository_link` applied against Postgres (adds optional `Application.codeRepositoryId` with `onDelete: SetNull` + `@@index`; adds `applications[]` back-relation on `CodeRepository`). `lib/code-repository.ts` gains `setCodeRepositoryApplicationLinks` (transactional relink), `listApplicationsForLinking`, and `listCodeRepositories` now includes linked apps. `PATCH /api/admin/code/[id]` accepts `{ applicationIds }` (Zod, max 50) and writes `code.repository.link` audit. `GET /api/admin/code` now returns `{ items, applications }`. Admin `CodePanel` grows a checkbox editor per repo with a "currently linked elsewhere" warning. `/applications/[slug]` surfaces a "Source code" card (lang, branch, stars, open issues, latest commit, GitHub link) **only when the linked repo is PUBLIC**. Fixed `scripts/dev-web.mjs` hard-coding `DATABASE_URL="file:./dev.db"` in the child-process env (was overriding `.env.local` every dev session); flipped `apps/web/.env.local` DATABASE_URL from SQLite → Postgres; corrected `apps/web/AGENTS.md` SQLite/Postgres drift; changed desktop-launcher `Categories=Network;Development;` → `Categories=Development;WebDevelopment;` (freedesktop main-category hint). **124/124 unit tests pass** (3 new in `code-repository.test.ts`), lint + typecheck + build green; desktop icon validated via `desktop-file-validate` + `gio launch` (exit 0) + runtime curl.
- **Local dev surface (2026-04-22):** canonical dev port **43907** wired through `scripts/dev-web.mjs` (with `SITE_PORT` env override); desktop launcher at `~/Desktop/SavigeSystemZ-local.desktop` and installer template re-pointed from port 3000 (Immortality app collision) to 43907.
- **Code module M10 scaffold (2026-04-22, committed `68e2f46`):** `CodeRepository` Prisma model (+ `CodeRepositoryProvider`, `CodeRepositorySyncStatus` enums) with migration `0002_code_repository` **applied against Postgres**; `lib/github-client.ts` (GitHub REST via `fetch` + optional `GITHUB_TOKEN`); `lib/code-repository.ts` (create-from-ref, sync, list, dedupe); admin APIs `/api/admin/code` (GET list, POST create) and `/api/admin/code/[id]` (POST sync, DELETE untrack); admin page `/admin/code` with `CodePanel` client component; admin nav link. **121/121 unit tests pass** (10 new), **62 E2E pass / 1 skip / 0 fail** (6 new in `admin-code.spec.ts`), lint + typecheck + build all clean.
- Public shell: flagship visual redesign across home, applications, downloads, pricing, bio, reviews, services, shared header/footer, AI dock, and stronger design system / motion / typography.
- Catalog and data model: application showcase fields, real Prisma-backed app catalog, version/release asset model, media model, archive entries, creator submissions, creator promotion tracking, seeded showcase data and artwork.
- Admin control plane: owner dashboard, application manager, release manager, archive manager, media manager, moderation queue, audit viewer, passkey/admin auth posture, launch readiness indicators, one-click publish flows for applications and archive entries.
- Release operations: release asset S3 presign flow, application media S3 presign flow, launch readiness helper, application publish route, archive publish route, and guided application launch composer that can create the first version + first asset and auto-publish when blockers are clear.
- Archive launch composer: guided draft-to-publish flow for archive entries (`POST /api/admin/archive/launch-compose`) with collapsible UI in archive manager, auto-publish when readiness blockers clear.
- Creator lane: public creator intake, moderation queue, promotion bridge from approved submissions into draft applications/archive entries, dual deep links ("Edit draft" + "Launch composer") from moderation panel into appropriate admin surfaces.
- Archive lane: public archive index/detail pages, archive taxonomy, owner archive CRUD, archive publish readiness, and guided archive launch composer.
- Commerce/auth: checkout completion establishes a DB-backed user session, dashboard resolves licensed applications and entitled assets, owner login remains session-cookie backed and no longer trusts spoofable client headers.
- AI/archive routing: concierge logic is now grounded in real archive/catalog routes instead of stubbed suggestions.
- Verification: lint, typecheck, unit tests, and builds passed after the latest launch-composer pass; live runtime probes verified blocked launch composition, publish-through launch composition, and public-route surfacing.

## Not finished — must carry forward

| Item | Why it matters | Where to continue |
|------|----------------|-------------------|
| **Real S3 bucket wiring** | Owner upload lanes correctly return `501` until env is configured | `infra/.env.example`, S3 setup, release/media presign routes |
| **Postgres cutover** | SQLite migrations are still local-dev only | flip provider in `schema.prisma`, regenerate migrations, `docs/POSTGRES_*` |
| **S3 malware scan** | Vault scan Lambda is still a starter | `infra/s3-vault-scan-lambda/`, `docs/S3_VAULT_LAMBDA_SCAN.md` |
| **Stripe live keys** | Mock commerce works; real Stripe needs `STRIPE_SECRET_KEY` + webhook secret | `docs/STRIPE_WEBHOOK_TESTING.md` |
| ~~Application ↔ CodeRepository link~~ | **Done 2026-04-22** — migration `0003`, admin linker UI, public "Source code" card on `/applications/[slug]` when repo is PUBLIC | — |
| **Visibility toggle on `/admin/code`** | Repo visibility currently only flippable via DB; blocks the public "Source code" card from appearing without a DB poke | `components/admin/code-panel.tsx` + reuse existing `PATCH /api/admin/code/[id]` (extend schema with `visibility`) |
| **Public repo detail page** | Closes the "displays code works" loop — README render for PUBLIC repos | New route `app/(public)/repos/[slug]/page.tsx` + GitHub contents API sync |
| **Code admin UX polish** | Visibility toggle + "Sync all" batch action are not yet in `/admin/code` | `components/admin/code-panel.tsx` |
| **GitHub webhook intake** | Auto-sync on push avoids the manual Sync click | New `app/api/webhooks/github/route.ts` + HMAC verification |
| **Self-hosted git storage (M11)** | Admin /code currently mirrors GitHub metadata only — the "store code like GitHub" promise needs a storage backend | See `VISION_AND_ROADMAP.md` M11 |

## Explicit TODO (sync with `TODO.md`)

- [x] Extend guided launch choreography to archive entries and promoted creator drafts.
- [x] Playwright: archive launch (8), moderation (5), commerce (7), full pipeline (6), a11y (13 routes). 56 passed, 0 failed.
- [x] A11y: fixed WCAG select-name/input-name violations, 13 axe routes green.
- [x] Fixed login rate limit (15→30/min) causing E2E failures across full suite.
- [x] Added force-dynamic to creator + dashboard pages (Prisma without it = build-time bomb).
- [ ] Configure real S3 buckets/credentials for release and media uploads, then verify direct upload from owner UI.
- [ ] Postgres-native migrations + CI job after Prisma provider flip.
- [ ] Deploy real S3 scan + quarantine (extend starter Lambda).
- [ ] Stripe live-path staging smoke and broader E2E hardening where stable in CI.

## Quick commands

```bash
pnpm install && pnpm check:all
pnpm dev:web   # random localhost port; check launcher output
pnpm --filter web lint
pnpm --filter web typecheck
pnpm --filter web test
pnpm build:web
```

## Desktop launcher

- **`installer/desktop/`** — run **`./install-desktop-launcher.sh`** to place a shortcut on your Desktop (see README there).

## Desktop launcher (canonical port)

- Canonical dev port is **43907** (set in `apps/web/.env.example` as `SITE_URL` + `SITE_PORT`).
- `scripts/dev-web.mjs` prefers that port. Override with `SITE_PORT=<port> pnpm dev:web` to pick a different one.
- Desktop shortcut is regenerated by `installer/desktop/install-desktop-launcher.sh` and targets 43907. If port 3000 ever comes back in the shortcut, a different local app has overwritten it.

**Last updated:** 2026-04-22 (M7 slices 1-5 + night operational wrap)
