# Where Left Off

- **Timestamp:** 2026-04-06 (session concluded)
- **Status:** P0/P1/P2 items complete (except external-dependency-blocked items). Full suite green on both SQLite and PostgreSQL.
- **Commits this session:**
  - `7e50c66` — fix 6 E2E failures: a11y labels, commerce assertions, login rate limit
  - `c00949a` — full-pipeline E2E test + force-dynamic on creator/dashboard pages
  - `101cebc` — auth module unit tests (15 tests) + session recall update
  - `5a82c38` — dynamic sitemap from DB + robots.txt blocks admin/API routes
  - `25b4190` — handoff update
  - `e20a64c` — PostgreSQL cutover, S3 vault scan Lambda, CI with Postgres service
- **Quality gates:** lint, typecheck, 111 unit tests, 56 E2E tests, build — all green on Postgres
- **Git:** All pushed to `git@github.com:SavigeSystemZ/SavigeSystemZ.com.git`

## Completed this session

| Item | Details |
|------|---------|
| E2E stabilization | Fixed 6 failures → 0. A11y labels, commerce assertions, login rate limit (15→30/min), force-dynamic |
| Full pipeline test | 6-test chain: submit → moderate → promote → verify draft → publish → verify public |
| Auth unit tests | 15 tests covering session signing, access code validation, requireOwner guard |
| Dynamic sitemap | Queries DB for published entries with real updatedAt timestamps |
| robots.txt | Blocks /admin/, /api/, /owner/, /dashboard |
| **PostgreSQL cutover** | Schema flipped to postgresql, baseline migration, 56 E2E tests verified against Docker Postgres |
| **S3 vault scan Lambda** | ClamAV-based: download → scan → tag → quarantine → SNS notify |
| **CI with Postgres** | Both quality and E2E jobs use Postgres service containers |
| Dev scripts | `scripts/dev-postgres.sh` and `scripts/dev-sqlite.sh` for local dev |

## Blocked — needs credentials from owner

| Item | What's needed | Instructions |
|------|---------------|--------------|
| S3 bucket wiring | AWS credentials + bucket | See credential instructions below |
| Stripe live staging | Stripe test keys | See credential instructions below |
| Domain verification | DNS access | See credential instructions below |
| S3 vault scan deploy | AWS Lambda deploy access | Lambda code ready, needs deploy |

## Next steps when credentials are available

1. Set AWS env vars → verify upload from owner UI
2. Set Stripe test keys → run `pnpm --filter web test:e2e` with real Stripe
3. Deploy vault scan Lambda with ClamAV layer
4. Verify domain routing to correct app

## Full recall

`SESSION_RECALL.md` — full done/not-done checklist.
