# Vision and roadmap (SavigeSystemZ.com)

## Vision

A **production-grade** public site and operations shell for the SavigeSystemZ foundry: secure owner/admin workflows, commerce (Stripe), encrypted vault artifacts with optional S3 payloads, auditability, and a path to **PostgreSQL** + horizontal scale without sacrificing the SQLite-first dev story.

## Pillars

| Pillar | Intent | Status |
|--------|--------|--------|
| **Public experience** | Best-in-class app showcase, archive, creator ecosystem | Active — pages and flows built |
| **Admin operations** | Owner dashboard, moderation, launch composers, audit | Active — application launch composer done, archive launch pending |
| **Security** | Session auth, hardened headers, no header-based trust, vault crypto + rate limits | Active |
| **Commerce** | Checkout, webhooks, signed downloads, entitlements | Active — mock flow works, live Stripe staging pending |
| **Vault** | AES-GCM, legacy key rotation, S3 hybrid, optional Redis limits | Active |
| **Observability** | Audit logs, health + Redis probe | Active |
| **Data plane** | Prisma + SQLite dev; Postgres docs + compose | Path documented, cutover pending |
| **Content safety** | S3 scan pipeline | Reference Lambda + docs |

## Near-term roadmap (aligned with TODO.md)

### P0 — Launch and owner flow
1. **Archive launch composer** — guided draft-to-launch matching the application launch composer
2. **Creator-to-launch handoff** — reduce manual bouncing after moderation promotion
3. **Real S3 buckets** — configure AWS credentials, verify owner upload UI end-to-end
4. **Git remote + push** — establish origin and push all local commits

### P1 — Product quality and coverage
5. **Playwright expansion** — moderation, promotion, launch, publish, archive flows
6. **Commerce staging** — live Stripe path smoke test
7. **A11y polish** — rerun axe, fix regressions

### P2 — Production path
8. **Postgres cutover** — flip provider, regenerate migrations, CI against Postgres
9. **S3 malware scan** — deploy real scanner + quarantine Lambda
10. **Domain verification** — attach savigesystemz.com to correct Vercel project
11. **CI/CD** — GitHub Actions for `pnpm check:all` + Playwright

## Handoff

- **Short pulse:** `WHERE_LEFT_OFF.md`
- **Do-not-skip checklist:** `SESSION_RECALL.md`
- **Action items:** `TODO.md`
