# Vision and roadmap (SavigeSystemZ.com)

## Vision

A **production-grade** public site and operations shell for the SavigeSystemZ foundry: secure owner/admin workflows, commerce (Stripe), encrypted vault artifacts with optional S3 payloads, auditability, and a path to **PostgreSQL** + horizontal scale without sacrificing the SQLite-first dev story.

## Pillars (in progress)

| Pillar | Intent | Status |
|--------|--------|--------|
| **Security** | Session auth, hardened headers, no header-based trust, vault crypto + rate limits | Active |
| **Commerce** | Checkout, webhooks, signed downloads | Active |
| **Vault** | AES-GCM, legacy key rotation, S3 hybrid, optional Redis limits | Active |
| **Observability** | Audit logs, health + Redis probe | Active |
| **Data plane** | Prisma + SQLite dev; Postgres docs + compose | Path documented |
| **Content safety** | S3 scan pipeline | Reference Lambda + docs |

## Near-term roadmap

1. **Postgres cutover** — regenerate **Postgres-native** migrations when `provider` flips; CI against a service container (see `docs/POSTGRES_CUTOVER_CHECKLIST.md`).
2. **Malware pipeline** — deploy `infra/s3-vault-scan-lambda` (or equivalent) with real scanner + quarantine.
3. **Rate limits** — optional **`VAULT_REDIS_STRICT`** in production Redis setups; extend shared sliding-window helper to other routes if needed.
4. **Hardening** — continue OWASP-aligned reviews (`docs/SECURITY_HARDENING.md`).

## Handoff

- **Short pulse:** **`WHERE_LEFT_OFF.md`**
- **Do-not-skip checklist:** **`SESSION_RECALL.md`**
- **Action items:** **`TODO.md`**
