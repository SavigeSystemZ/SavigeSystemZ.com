# TODO — SavigeSystemZ.com

Cross-check **`SESSION_RECALL.md`** and **`WHERE_LEFT_OFF.md`** so nothing is dropped.

## P0 — launch and owner flow

- [x] **Archive launch composer:** guided draft-to-launch flow for archive entries (API + UI).
- [x] **Creator draft handoff:** dual deep links ("Edit draft" + "Launch composer") from moderation panel.
- [ ] **Owner uploads live:** configure real S3 buckets/credentials and verify direct upload from release/media/launch composer surfaces.

## P1 — product quality and coverage

- [ ] **Playwright:** moderation -> promote -> launch compose -> publish coverage, plus archive publish coverage.
- [ ] **Commerce:** live-path Stripe staging smoke and follow-up dashboard/download verification.
- [ ] **A11y / polish:** rerun axe and tighten any regressions after the expanded public/admin UI passes.

## P2 — production path

- [ ] **Postgres:** switch `apps/web/prisma/schema.prisma` to `postgresql`, generate **new** migrations, run CI against Postgres service (see `docs/POSTGRES_CUTOVER_CHECKLIST.md`, `docs/CI_POSTGRES.md`).
- [ ] **S3 vault scan:** replace placeholder in `infra/s3-vault-scan-lambda/handler.mjs` with real scanner + IAM; wire bucket notification (`docs/S3_VAULT_LAMBDA_SCAN.md`).
- [ ] **Redis elsewhere:** if horizontally scaled, reuse sliding-window pattern for `lib/auth-rate-limit.ts` and `app/api/project-requests/route.ts` (see `docs/RATE_LIMITS.md`).
- [ ] **Strict Redis ops:** alerts when `vaultMutationRedis` probe is `error` or 503 rate spikes with `VAULT_REDIS_STRICT=1`.

## Done (archive reference)

- [x] Public catalog API + seed wiring; mock commerce E2E.
- [x] Cursor/agent ergonomics (`.cursor/rules`, `AGENTS.md`, `.vscode` optional).
- [x] AI agent system audit, buildout, session changelog (16 coherence fixes, PATTERNS.md, TROUBLESHOOTING.md, root CLAUDE.md).
- [x] Git remote + push to GitHub (SavigeSystemZ/SavigeSystemZ.com, private).
- [x] Archive launch composer (guided draft-to-publish) and creator-to-launch handoff (deep links).
- [x] Vault crypto, legacy key, Redis limiter, strict mode, reencrypt script, health probes.
- [x] Starter S3 Lambda folder + dev compose bundle.
- [x] Flagship public redesign, application catalog/detail routes, archive system, creator intake/moderation/promotion, media galleries, launch readiness, publish flows, and guided application launch composer.
