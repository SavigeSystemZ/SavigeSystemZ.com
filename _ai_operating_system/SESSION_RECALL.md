# Session recall — do not skip

Use this file when resuming work so nothing is skimmed or forgotten. **`WHERE_LEFT_OFF.md`** stays the short pulse; this is the **checklist depth**.

## Done and verified (recent)

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
| **Playwright expansion** | New moderation/promotion/launch publish loops are not covered end to end | `apps/web/tests/e2e/` |
| **Postgres cutover** | SQLite migrations are still local-dev only | flip provider in `schema.prisma`, regenerate migrations, `docs/POSTGRES_*` |
| **S3 malware scan** | Vault scan Lambda is still a starter | `infra/s3-vault-scan-lambda/`, `docs/S3_VAULT_LAMBDA_SCAN.md` |

## Explicit TODO (sync with `TODO.md`)

- [x] Extend guided launch choreography to archive entries and promoted creator drafts.
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

**Last updated:** 2026-04-06 (archive launch composer + creator handoff session)
