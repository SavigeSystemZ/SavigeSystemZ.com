# TODO — SavigeSystemZ.com

Cross-check **`SESSION_RECALL.md`** and **`WHERE_LEFT_OFF.md`** so nothing is dropped.

## P0 — data and production path

- [ ] **Postgres:** switch `apps/web/prisma/schema.prisma` to `postgresql`, generate **new** migrations (do not reuse SQLite SQL), run CI against Postgres service (see `docs/POSTGRES_CUTOVER_CHECKLIST.md`, `docs/CI_POSTGRES.md`).
- [ ] **S3 vault scan:** replace placeholder in `infra/s3-vault-scan-lambda/handler.mjs` with real scanner + IAM; wire bucket notification (`docs/S3_VAULT_LAMBDA_SCAN.md`).

## P1 — scale and limits

- [ ] **Redis elsewhere:** if horizontally scaled, reuse sliding-window pattern for `lib/auth-rate-limit.ts` and `app/api/project-requests/route.ts` (see `docs/RATE_LIMITS.md`).
- [ ] **Strict Redis ops:** alerts when `vaultMutationRedis` probe is `error` or 503 rate spikes with `VAULT_REDIS_STRICT=1`.

## P2 — product and quality

- [ ] **Stripe:** live-path smoke on staging (`docs/STRIPE_WEBHOOK_TESTING.md`).
- [ ] **Vault:** optional E2E for S3 path + rate-limit 429/503 where stable in CI.
- [ ] **UI / a11y:** flagship polish pass; re-run axe E2E after large UI changes.

## Done (archive reference)

- [x] Public catalog API + seed wiring; mock commerce E2E.
- [x] Cursor/agent ergonomics (`.cursor/rules`, `AGENTS.md`, `.vscode` optional).
- [x] Vault crypto, legacy key, Redis limiter, strict mode, reencrypt script, health probes.
- [x] Starter S3 Lambda folder + dev compose bundle.
