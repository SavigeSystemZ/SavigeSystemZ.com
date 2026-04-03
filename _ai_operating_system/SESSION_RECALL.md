# Session recall — do not skip

Use this file when resuming work so nothing is skimmed or forgotten. **`WHERE_LEFT_OFF.md`** stays the short pulse; this is the **checklist depth**.

## Done and verified (recent)

- Public shell: flagship visual redesign across home, applications, downloads, pricing, bio, reviews, services, shared header/footer, AI dock, and stronger design system / motion / typography.
- Catalog and data model: application showcase fields, real Prisma-backed app catalog, version/release asset model, media model, archive entries, creator submissions, creator promotion tracking, seeded showcase data and artwork.
- Admin control plane: owner dashboard, application manager, release manager, archive manager, media manager, moderation queue, audit viewer, passkey/admin auth posture, launch readiness indicators, one-click publish flows for applications and archive entries.
- Release operations: release asset S3 presign flow, application media S3 presign flow, launch readiness helper, application publish route, archive publish route, and guided application launch composer that can create the first version + first asset and auto-publish when blockers are clear.
- Creator lane: public creator intake, moderation queue, promotion bridge from approved submissions into draft applications/archive entries, and direct deep links back into the owning admin editors.
- Archive lane: public archive index/detail pages, archive taxonomy, owner archive CRUD, and archive publish readiness.
- Commerce/auth: checkout completion establishes a DB-backed user session, dashboard resolves licensed applications and entitled assets, owner login remains session-cookie backed and no longer trusts spoofable client headers.
- AI/archive routing: concierge logic is now grounded in real archive/catalog routes instead of stubbed suggestions.
- Verification: lint, typecheck, unit tests, and builds passed after the latest launch-composer pass; live runtime probes verified blocked launch composition, publish-through launch composition, and public-route surfacing.

## Not finished — must carry forward

| Item | Why it matters | Where to continue |
|------|----------------|-------------------|
| **Archive launch composer** | Archive drafts still publish through separate CRUD, not the same guided launch flow | `apps/web/app/api/admin/archive/*`, archive admin UI |
| **Creator-to-launch handoff** | Promoted drafts still require manual navigation into release/archive editors | moderation/admin surfaces + launch flows |
| **Real S3 bucket wiring** | Owner upload lanes correctly return `501` until env is configured | `infra/.env.example`, S3 setup, release/media presign routes |
| **Playwright expansion** | New moderation/promotion/launch publish loops are not covered end to end | `apps/web/tests/e2e/` |
| **Postgres cutover** | SQLite migrations are still local-dev only | flip provider in `schema.prisma`, regenerate migrations, `docs/POSTGRES_*` |
| **S3 malware scan** | Vault scan Lambda is still a starter | `infra/s3-vault-scan-lambda/`, `docs/S3_VAULT_LAMBDA_SCAN.md` |

## Explicit TODO (sync with `TODO.md`)

- [ ] Extend guided launch choreography to archive entries and promoted creator drafts.
- [ ] Configure real S3 buckets/credentials for release and media uploads, then verify direct upload from owner UI.
- [ ] Add Playwright coverage for creator moderation -> promote -> compose launch -> publish.
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

**Last updated:** 2026-04-03 (stop session)
