# Launch Checklist

- [ ] `./scripts/verify-release.sh` green (lint, typecheck, test, build, 52/52 catalog)
- [ ] `./scripts/verify-release.sh --with-staging-probes` green when Stripe/S3 staging env configured
- [ ] Lint, typecheck, tests, and build green in CI
- [ ] `pnpm code:verify-catalog` passes in CI with `GITHUB_MOCK_MODE=1`
- [ ] Lighthouse budgets reviewed for home/catalog/detail/downloads/repos
- [ ] Accessibility checks reviewed for WCAG 2.2 AA (13+ public routes + admin)
- [ ] Admin/private routes negative tests validated
- [ ] Payment webhook verification tests pass
- [ ] Owner S3 presign upload verified from `/admin/media` and Release Manager
- [ ] Packaging artifacts generated with checksums
- [ ] Rollback and incident procedures confirmed

See **docs/CATALOG_OPERATIONS.md** for bootstrap, screenshot tiers, and E2E commands.
