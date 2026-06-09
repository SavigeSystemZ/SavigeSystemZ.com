# Risk Register

## Active risks

| # | Risk | Impact | Likelihood | Mitigation |
|---|------|--------|-----------|------------|
| R1 | **No git remote configured** ✅ RESOLVED — `origin/main` exists, commits pushed | High | Low (resolved) | Maintain push discipline |
| R2 | **S3 buckets not wired** — release/media/vault uploads return 501 | Medium | Certain | Configure real AWS buckets + credentials in env |
| R3 | **SQLite in dev, Postgres in prod** — migration SQL divergence | High | High | Do not reuse SQLite migration SQL; regenerate when switching provider |
| R4 | **Domain routing unverified** — savigesystemz.com may point to wrong app | High | Medium | Follow `docs/PRODUCTION_DOMAIN_VERIFICATION.md` before launch |
| R5 | **S3 malware scan is placeholder** — uploaded files are not scanned | Medium | Low (pre-launch) | Deploy real scanner via `infra/s3-vault-scan-lambda/` |
| R6 | **No CI/CD pipeline** — quality gates are manual only | Medium | Medium | Set up GitHub Actions with `pnpm check:all` + Playwright |
| R7 | **Scope explosion across milestones** — trying to do too much per session | Medium | Medium | Enforce milestone boundaries; finish P0 before P1 |
| R8 | **Security drift between public and private surfaces** | High | Low | Central authz via `requireOwner()`, negative E2E tests |
| R9 | **Performance regressions from visual richness** | Medium | Medium | Core Web Vitals budgets, Lighthouse gating |

## Retired risks

- ~~Header-based auth trust~~ — eliminated; session cookie + DB only since auth hardening pass.
