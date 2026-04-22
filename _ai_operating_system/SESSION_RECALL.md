# Session recall — do not skip

Use this file when resuming work so nothing is skimmed or forgotten. **`WHERE_LEFT_OFF.md`** stays the short pulse; this is the **checklist depth**.

## Done and verified (recent)

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
| **Application ↔ CodeRepository link** | Apps should surface their source repo; currently the two models are unconnected | Extend `schema.prisma` with relation, migration, update app detail page |
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

**Last updated:** 2026-04-22 (canonical port + Code module M10 scaffold session)
