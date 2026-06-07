# Catalog operations — GitHub org mirror to public storefront

Operator runbook for the **52-repo SavigeSystemZ org catalog**: bootstrap, verify, screenshots, staging probes, and E2E.

## Prerequisites

- Postgres running locally: `./scripts/dev-postgres.sh` → `postgresql://ssz:dev@localhost:5433/savige`
- Optional: `GITHUB_TOKEN` in `apps/web/.env.local` for live GitHub API (higher rate limits). CI uses **`GITHUB_MOCK_MODE=1`** instead.

## Bootstrap (full foundry sync)

Runs sync → flagship apps → SVG heroes → screenshot fetch → release/media seed:

```bash
export DATABASE_URL=postgresql://ssz:dev@localhost:5433/savige
pnpm code:bootstrap
```

Individual steps (same order as bootstrap):

| Command | Purpose |
|---------|---------|
| `pnpm code:sync-org` | Import/update PUBLIC `CodeRepository` rows from GitHub org |
| `pnpm code:seed-apps` | Link org repos → `Application` catalog entries |
| `pnpm code:generate-showcases` | Write hero SVGs under `public/showcase/` |
| `pnpm code:fetch-screenshots` | Cache PNG previews under `public/showcase/screenshots/` (7-day refresh; `REFETCH_SCREENSHOTS=1` to force) |
| `pnpm code:seed-releases` | v0.1.0 versions, media rows, release assets |

## Verify catalog integrity

Exits non-zero if any PUBLIC repo is missing app, media, or v0.1.0 release lane:

```bash
pnpm code:verify-catalog
# CI-style (no live GitHub):
GITHUB_MOCK_MODE=1 pnpm code:verify-catalog
# Require Playwright UI catalog PNGs on disk (52/52):
pnpm --filter web code:verify-catalog -- --require-ui-catalog
```

Expected output: `ok: true`, `expectedRepoCount: 52`, `issueCount: 0`.

## Screenshot tiers (display priority)

Resolved by `apps/web/lib/catalog-showcase-media.ts`:

1. **Manual** — `public/showcase/manual/{slug}/preview.png` (live app UI when dev server running)
2. **UI catalog** — `public/showcase/ui-catalog/{slug}.png` (SavigeSystemZ detail page render)
3. **Cached** — `public/showcase/screenshots/{slug}.png` (GitHub OG fetch)
4. **GitHub Open Graph** — remote fallback

Admin promotion: **`POST /api/admin/application-media/[id]/set-catalog-screenshot`** (UI button on `/admin/media`).

## Live UI screenshots (Playwright)

Capture live app UIs when dev servers are running, plus SavigeSystemZ catalog detail pages for all slugs:

```bash
SITE_URL=http://127.0.0.1:43907 pnpm code:capture-ui-screenshots
```

Outputs:

| Path | Content |
|------|---------|
| `public/showcase/manual/{slug}/preview.png` | Live app UI (only when launch URL responds) |
| `public/showcase/ui-catalog/{slug}.png` | SavigeSystemZ `/applications/{slug}` render |
| `docs/CATALOG_UI_SCREENSHOT_REPORT.md` | Operator follow-up for apps that did not launch |

Registry: `apps/web/lib/catalog-launch-registry.ts`. Exit code **2** when apps need operator action (use `--allow-partial` to continue).

```bash
pnpm code:capture-ui-screenshots -- --catalog-only          # SSZ catalog pages only
pnpm code:capture-ui-screenshots -- --apps-only             # live app UIs only (fast re-probe)
pnpm code:capture-ui-screenshots -- --only=ideaforge          # single slug
pnpm code:capture-ui-screenshots -- --allow-partial           # exit 0 with follow-up report
pnpm code:refresh-showcase                                    # capture + seed-releases (sync DB URLs)
pnpm code:discover-launches                                   # LIVE/DOWN/NO_URL report for MyAppZ apps
CAPTURE_UI=1 pnpm code:bootstrap                              # bootstrap + capture + media sync
```

## Staging readiness

Env checklist + catalog merge:

```bash
pnpm staging:verify
```

Live HTTP + S3 presign smoke (dev server on 43907, owner code in `.env.local`):

```bash
SITE_URL=http://127.0.0.1:43907 pnpm staging:verify -- --probe-http --probe-presign
```

Required for `ok: true`: Stripe test keys, S3 media/release buckets, `AWS_S3_PRESIGN_ENABLED=1`, IAM credentials. See `apps/web/.env.example` and `infra/.env.example`.

## Pre-merge verification

```bash
./scripts/verify-release.sh
# With staging secrets configured:
./scripts/verify-release.sh --with-staging-probes
```

Runs `pnpm check:all` + `pnpm code:verify-catalog` (+ optional staging probes).

## E2E

```bash
# Reuse running dev server (recommended locally):
E2E_PORT=43907 pnpm --filter web test:e2e

# CI-style (stop local dev server first — Next.js 16 blocks duplicate next dev):
CI=1 E2E_PORT=3456 OWNER_ACCESS_CODE=e2e-owner-code \
  OWNER_LOGIN_SECRET=e2e-owner-secret-change-me-32chars \
  pnpm --filter web test:e2e
```

Key specs: `catalog-coverage.spec.ts` (all slugs), `flagship-catalog.spec.ts`, `staging-presign.spec.ts`, `admin-media-catalog.spec.ts`.

## Landing the completion batch

Themed commits (after green verify):

```bash
./scripts/land-catalog-completion.sh --dry-run   # preview
./scripts/land-catalog-completion.sh             # interactive
```

See also: `docs/LAUNCH_CHECKLIST.md`, `docs/STRIPE_WEBHOOK_TESTING.md`, `apps/web/AGENTS.md`.
