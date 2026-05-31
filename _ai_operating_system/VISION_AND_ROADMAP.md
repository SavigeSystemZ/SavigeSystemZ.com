# Vision and roadmap (SavigeSystemZ.com)

## Vision

A **masterpiece world-class ultimate showcase website platform**. This production-grade public site and operations shell for the SavigeSystemZ foundry will:
- House, host, and showcase applications (both free and for-sale).
- Share and showcase dotfiles, scripts, program settings, custom OS builds, and software/freeware.
- Provide links to helpful resources and excellent GitHub repositories.
- Host hacking content, payloads, and security recommendations.
- Showcase custom-developed Games and Books.
- Feature System Admin type meta-systems, trained AIs, and links to other good LLMs.
- Provide guides, tips, and tricks for various systems and tasks, including OPNsense builds, instructions, and instructional videos/YouTube links.
- Offer secure owner/admin workflows, commerce (Stripe), encrypted vault artifacts with optional S3 payloads, auditability, and a path to **PostgreSQL** + horizontal scale.

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
| **Code / GitHub** | Owner-scoped dashboard mirroring GitHub repos; path to self-hosted git storage | M10 scaffold landed; M11 storage backend scoped |

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

### M10 — Code module (scaffold + tests DONE; polish queued as M5.1–M5.4)
12. **Admin /code panel** — DONE. Track GitHub repos, sync metadata, audit-logged mutations (`68e2f46`).
13. **Tests** — DONE. Unit + E2E green.
14. **Public detail pages** — queued as M5.3 (see `PROMPT_PACK.md` Part II).

### M10.5 — Application ↔ CodeRepository link (DONE 2026-04-22)
15. **Optional FK** `Application.codeRepositoryId` with `onDelete: SetNull` + back-relation. Admin linker UI + public "Source code" card on `/applications/[slug]` for PUBLIC repos. Shipped in `c70ab8c`.

### M11 — Self-hosted code storage (PENDING DECISION)
16. **Backend decision** — Gitea sidecar vs. S3-mirrored bare repos. Decision matrix + current state in `docs/CODE_STORAGE.md`.
17. **Push/pull protocol** — smart HTTP vs. read-only mirror, with entitlements for PRIVATE repos.
18. **Webhook intake** — queued as M5.4 for metadata sync; extended in M11 for blob sync.

### Doc alignment (DONE 2026-04-22 — this session)
- Postgres is the dev AND prod story across `docs/DATABASE.md`, `README.md`, `CLAUDE.md`; SQLite documented only as fallback via `scripts/dev-sqlite.sh`.
- New stubs: `docs/UX_SYSTEM.md` (M1 fills), `docs/AI_INTEGRATION_STRATEGY.md` (M6 fills), `docs/CODE_STORAGE.md` (M11 decision), `docs/DEV_ENV_GOTCHAS.md` (running list).
- `_ai_operating_system/PROMPT_PACK.md` gains Part II — refined per-milestone session prompts for M0–M8 + Review.

## Handoff

- **Short pulse:** `WHERE_LEFT_OFF.md`
- **Do-not-skip checklist:** `SESSION_RECALL.md`
- **Action items:** `TODO.md`
