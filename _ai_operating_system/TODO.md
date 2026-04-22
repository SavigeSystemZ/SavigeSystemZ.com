# TODO — SavigeSystemZ.com

Cross-check **`SESSION_RECALL.md`** and **`WHERE_LEFT_OFF.md`** so nothing is dropped.

## P0 — launch and owner flow

- [x] **Archive launch composer:** guided draft-to-launch flow for archive entries (API + UI).
- [x] **Creator draft handoff:** dual deep links ("Edit draft" + "Launch composer") from moderation panel.
- [x] **Canonical dev port + desktop launcher:** port 43907 wired into `dev-web.mjs`; desktop icon no longer conflicts with the Immortality app.
- [x] **Code module scaffold:** `CodeRepository` model + migration `0002_code_repository`, GitHub client, admin /code page and API routes, admin nav link, `GITHUB_TOKEN` env.
- [ ] **Owner uploads live:** configure real S3 buckets/credentials and verify direct upload from release/media/launch composer surfaces.
- [ ] **Apply Code migration:** run `scripts/dev-postgres.sh` + `pnpm --filter web prisma migrate deploy`; round-trip connect/sync/remove via `/admin/code`.

## P1 — product quality and coverage

- [x] **Playwright:** archive launch composer (8 tests), creator moderation + promotion (5 tests), expanded commerce (7 tests), a11y (13 routes). Full suite: 50 passed, 0 failed.
- [x] **A11y / polish:** fixed WCAG select-name/input-name violations on archive, creator form, and application manager. 13 axe routes all green.
- [ ] **Commerce:** live-path Stripe staging smoke and follow-up dashboard/download verification (needs `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`).
- [ ] **Code module tests:** `tests/unit/code-repository.test.ts` (create + dedupe + sync error), `tests/e2e/admin-code.spec.ts` (owner-gated connect/sync/remove).
- [ ] **Code module polish:** visibility toggle UI, manual "Sync all" batch action, per-repo audit detail drawer.

## P2 — production path

- [x] **Postgres:** switched to `postgresql` provider, baseline migration, CI jobs with Postgres service, `scripts/dev-postgres.sh` + `scripts/dev-sqlite.sh` for local dev. Full E2E (56 tests) verified against Docker Postgres.
- [x] **S3 vault scan:** ClamAV-based Lambda with download → scan → tag → quarantine → SNS notify flow. Ready for deploy with ClamAV Lambda layer.
- [x] **CI:** quality + E2E jobs both run against Postgres service containers.
- [ ] **Redis elsewhere:** if horizontally scaled, reuse sliding-window pattern for `lib/auth-rate-limit.ts` and `app/api/project-requests/route.ts` (see `docs/RATE_LIMITS.md`).
- [ ] **Strict Redis ops:** alerts when `vaultMutationRedis` probe is `error` or 503 rate spikes with `VAULT_REDIS_STRICT=1`.

## P3 — M11 self-hosted code storage (new milestone)

- [ ] **Backend decision:** evaluate Gitea sidecar container vs. S3-mirrored bare-repo approach. Capture trade-offs in `docs/CODE_STORAGE.md`.
- [ ] **Git hosting surface:** public `GET /repos/<slug>` detail page (README render, tree/blob browser), owner-only `POST /api/admin/code/<id>/sync-contents` to cache selected files.
- [ ] **Access control:** extend `AssetVisibility` reuse for code blobs, wire entitlements for PRIVATE repos.
- [ ] **Webhook intake:** GitHub webhook endpoint for push events → auto-trigger sync.

## Done (archive reference)

- [x] Public catalog API + seed wiring; mock commerce E2E.
- [x] Cursor/agent ergonomics (`.cursor/rules`, `AGENTS.md`, `.vscode` optional).
- [x] AI agent system audit, buildout, session changelog (16 coherence fixes, PATTERNS.md, TROUBLESHOOTING.md, root CLAUDE.md).
- [x] Git remote + push to GitHub (SavigeSystemZ/SavigeSystemZ.com, private).
- [x] Archive launch composer (guided draft-to-publish) and creator-to-launch handoff (deep links).
- [x] Vault crypto, legacy key, Redis limiter, strict mode, reencrypt script, health probes.
- [x] Starter S3 Lambda folder + dev compose bundle.
- [x] Flagship public redesign, application catalog/detail routes, archive system, creator intake/moderation/promotion, media galleries, launch readiness, publish flows, and guided application launch composer.
