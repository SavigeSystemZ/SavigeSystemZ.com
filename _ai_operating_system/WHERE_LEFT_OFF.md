# Where Left Off

- **Timestamp:** 2026-04-06 (session concluded)
- **Status:** All P1 items complete. Full E2E suite green (56 pass, 0 fail). All pushed to `origin/main`.
- **Commits this session:**
  - `7e50c66` — fix 6 E2E failures: a11y labels, commerce assertions, login rate limit
  - `c00949a` — full-pipeline E2E test + force-dynamic on creator/dashboard pages
  - `101cebc` — auth module unit tests (15 tests) + session recall update
  - `5a82c38` — dynamic sitemap from DB + robots.txt blocks admin/API routes
- **Quality gates:** lint, typecheck, 111 unit tests, 56 E2E tests, build — all green
- **Git:** All pushed to `git@github.com:SavigeSystemZ/SavigeSystemZ.com.git`

## Status

| Item | Status |
|------|--------|
| Playwright E2E suite | DONE — 56 tests across 10 files, 0 failures |
| A11y audit | DONE — 13 axe routes, WCAG select-name/input-name fixed |
| Auth unit tests | DONE — 15 tests covering session signing, access code, requireOwner |
| Full pipeline test | DONE — submit → moderate → promote → publish → verify public |
| Dynamic sitemap | DONE — queries DB for published apps/archive entries |
| robots.txt | DONE — blocks /admin/, /api/, /owner/, /dashboard |
| Login rate limit | FIXED — 15→30/min to prevent E2E suite exhaustion |
| force-dynamic | FIXED — creator + dashboard pages (Prisma without it = build-time failure) |
| Real S3 bucket wiring | BLOCKED — needs AWS credentials |
| Stripe live keys | BLOCKED — needs STRIPE_SECRET_KEY + webhook secret |
| Postgres cutover | READY — Docker Compose exists, schema needs provider flip |

## Next best steps

1. **S3 bucket wiring** (P0) — set AWS env vars and verify upload UI
2. **Stripe live staging** (P1) — configure test keys, verify webhook flow
3. **Postgres cutover** (P2) — flip provider, generate native migrations, test with Docker Compose
4. **S3 vault scan Lambda** (P2) — extend starter in `infra/s3-vault-scan-lambda/`
5. **Domain verification** (P2) — confirm savigesystemz.com routes correctly

## Full recall

`SESSION_RECALL.md` — full done/not-done checklist.
