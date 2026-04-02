# Session recall — do not skip

Use this file when resuming work so nothing is skimmed or forgotten. **`WHERE_LEFT_OFF.md`** stays the short pulse; this is the **checklist depth**.

## Done and verified (recent)

- Vault: AES-GCM, legacy key, `VAULT_STORED_KEY_VERSION`, S3 presign + optional SSE-KMS, rate limits (**memory / Redis Lua sliding window**), **`vaultMutationGate`**, **`VAULT_REDIS_STRICT`** → 503, health fields, `vault:reencrypt` script.
- Commerce: Stripe webhook processor + tests, checkout E2E, optional signed webhook spec.
- A11y: `#main-content`, axe E2E; API authz E2E including vault + **health** probe fields.
- Docs: `VAULT.md`, `RATE_LIMITS.md`, `S3_*`, Postgres path docs, `VISION_AND_ROADMAP.md`.
- Infra: `docker-compose.{postgres,redis,dev}.yml`, **`infra/s3-vault-scan-lambda/`** starter (placeholder handler).
- Agent context: `.cursor/rules/ssz-*.mdc`, `AGENTS.md`, `apps/web/AGENTS.md`.

## Not finished — must carry forward

| Item | Why it matters | Where to continue |
|------|----------------|-------------------|
| **Postgres cutover** | SQLite migrations ≠ Postgres SQL | Flip `provider` in `schema.prisma`, regenerate migrations, `docs/POSTGRES_*` |
| **S3 malware scan** | Starter Lambda only — no scanner | `infra/s3-vault-scan-lambda/`, `docs/S3_VAULT_LAMBDA_SCAN.md` |
| **Redis on other routes** | Only vault uses shared Redis limiter | `auth-rate-limit.ts`, `project-requests` if multi-instance |
| **`pnpm-lock.yaml` gitignored** | Reproducible CI | Deliberate? Revisit if you want frozen lock commits |
| **Flagship UI polish** | PLAN still mentions depth | Admin/public pass, design tokens |

## Explicit TODO (sync with `TODO.md`)

- [ ] Postgres-native migrations + CI job after Prisma provider flip.
- [ ] Deploy real S3 scan + quarantine (extend starter Lambda).
- [ ] Stripe **live** staging smoke; optional vault-boundary E2E hardening.
- [ ] Optional: shared `lib/rate-limit-redis` for auth + project-requests.
- [ ] Optional: `VAULT_REDIS_STRICT` monitoring / alert on 503 rate.
- [ ] Revisit a11y / flagship polish items in `TODO.md`.

## Quick commands

```bash
pnpm install && pnpm check:all
pnpm dev:web   # http://127.0.0.1:3000 — see README for Prisma migrate/seed
```

## Desktop launcher

- **`installer/desktop/`** — run **`./install-desktop-launcher.sh`** to place a shortcut on your Desktop (see README there).

**Last updated:** 2026-04-02 (stop session)
