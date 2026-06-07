# SavigeSystemZ.com

Flagship software-foundry website and operations platform, built as a Next.js monorepo.

**License:** [MIT](LICENSE) — open source; use and modify under the terms of that license.

## AI assistants (Cursor / IDE)

- **Project rules:** `.cursor/rules/ssz-*.mdc` — namespaced SavigeSystemZ pack (monorepo, `apps/web`, Prisma, security). See [`.cursor/README.md`](.cursor/README.md) and [`.cursor/apps/savigesystemz/APP_PACK.md`](.cursor/apps/savigesystemz/APP_PACK.md).
- **Agent entrypoints:** root [`AGENTS.md`](AGENTS.md) and [`apps/web/AGENTS.md`](apps/web/AGENTS.md).
- **Indexing:** `.cursorignore` trims noisy paths from Cursor’s index.
- **VS Code:** [`.vscode/settings.json`](.vscode/settings.json) and [`.vscode/extensions.json`](.vscode/extensions.json) for ESLint + Prisma.

## Production

If **savigesystemz.com** loads the wrong app (for example another product’s UI), the domain is pointed at the wrong deployment. See **[docs/PRODUCTION_DOMAIN_VERIFICATION.md](docs/PRODUCTION_DOMAIN_VERIFICATION.md)** for verification commands and DNS / Vercel fixes.

## Requirements

- **Node.js** 20.x or newer (LTS recommended)
- **pnpm** 10.x ([install](https://pnpm.io/installation))

## Run the website locally (host machine)

These steps let you develop and test on your own system before you buy hosting.

```bash
git clone <your-fork-or-repo-url> SavigeSystemZ.com
cd SavigeSystemZ.com
pnpm install
```

Configure the web app environment and database:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/web/.env.local`:

- **`SITE_URL`** — e.g. `http://127.0.0.1:43907` for local browsing (match the URL printed by `pnpm dev:web`).
- **`DATABASE_URL`** — canonical local value is `postgresql://ssz:dev@localhost:5433/savige`. Run `./scripts/dev-postgres.sh` to start the Docker Postgres and apply migrations + seed. (SQLite remains as a fallback via `./scripts/dev-sqlite.sh` — see `docs/DATABASE.md`.)
- **`OWNER_ACCESS_CODE`** / **`OWNER_LOGIN_SECRET`** — set long random strings for owner login at `/owner/login`.
- **Passkeys (optional locally):** for `http://127.0.0.1:43907`, align WebAuthn with your origin, for example:
  - `PASSKEY_RP_ID=127.0.0.1`
  - `PASSKEY_ORIGIN=http://127.0.0.1:43907`

Start Postgres (Docker) and the dev server:

```bash
./scripts/dev-postgres.sh      # provisions localhost:5433, runs prisma migrate deploy + seed
pnpm dev:web                    # canonical port 43907; falls back to random in 43000–44999 if busy
```

`pnpm dev:web` binds **127.0.0.1 only**. Open the exact **`http://127.0.0.1:<port>`** printed in the terminal (default: `http://127.0.0.1:43907/`). Override with `SITE_PORT=<port> pnpm dev:web`.

**Production-style run on the host** (after a successful build):

```bash
pnpm build:web
pnpm start:web
```

Use the same `apps/web/.env.local` (or production env vars) and ensure `DATABASE_URL` points at your real database for production.

See **`docs/DATABASE.md`** for migrations, seeding, and production Postgres notes.

**Optional local data services:** `docker compose -f docker-compose.postgres.yml up -d` and/or **`docker compose -f docker-compose.dev.yml up -d`** (Postgres + Redis) — see **`docs/POSTGRES_LOCAL.md`** and **`docs/RATE_LIMITS.md`**.

**Vault key rotation (offline):** after backup, `pnpm --filter web vault:reencrypt -- --dry-run` then without `--dry-run` — see **`docs/VAULT_KEY_ROTATION.md`**. Rate limits: **`docs/RATE_LIMITS.md`** (optional **`REDIS_URL`** + **`docker-compose.redis.yml`** for multi-instance). **`GET /api/health?probe=redis`** checks Redis when configured.

**Release asset uploads (optional):** set `AWS_S3_RELEASE_BUCKET` plus AWS credentials to enable owner-only presigned PUT uploads from the Release Manager. `AWS_S3_RELEASE_SSE_KMS_KEY_ID` enables SSE-KMS for release uploads.

**Application media uploads (optional):** set `AWS_S3_MEDIA_BUCKET` to isolate showcase screenshots and artwork from release files. If omitted, media uploads can fall back to `AWS_S3_RELEASE_BUCKET`. `AWS_S3_MEDIA_SSE_KMS_KEY_ID` enables a separate KMS key for media objects.

## Desktop shortcut (local)

After **`pnpm dev:web`**, open the site from your Desktop: run **`./installer/desktop/install-desktop-launcher.sh`** (see **`installer/desktop/README.md`**).

## Monorepo layout

- `apps/web` — Next.js web runtime
- `packages/*` — shared domain/security/ui/ai contracts
- `services/workers` — background pipeline shell
- `_ai_operating_system` — planning, prompt packs, handoff context
- `docs` — architecture and product docs
- `installer` — optional desktop packaging assets (not required to host the website)

## Quality gates

```bash
pnpm check:all
pnpm verify:release          # check:all + code:verify-catalog (52/52)
pnpm --filter web test:e2e   # see docs/CATALOG_OPERATIONS.md for E2E_PORT notes
```

**Catalog bootstrap / verify:** `pnpm code:bootstrap` then `pnpm code:verify-catalog` — full operator runbook in **[docs/CATALOG_OPERATIONS.md](docs/CATALOG_OPERATIONS.md)**.

Set `CI=1` for E2E if you want Playwright to always start a dedicated dev server (see `apps/web/playwright.config.ts`). Stop any running `pnpm dev:web` first — Next.js 16 blocks a second `next dev` in the same app directory. The suite includes **axe** scans on key public routes (`tests/e2e/a11y.spec.ts`) and **API authz** checks including owner-only `/api/vault` (with **AES-256-GCM** persistence when `VAULT_ENCRYPTION_KEY` is set — see `docs/VAULT.md`). Stripe webhook behavior is covered by unit tests (`tests/unit/stripe-webhook-*.ts`), a **501** guard E2E, and an **optional** signed POST spec (`tests/e2e/stripe-webhook-signed.spec.ts`, skipped without secrets). See `docs/STRIPE_WEBHOOK_TESTING.md` and workflow `.github/workflows/stripe-webhook-smoke.yml`.

## Commerce and downloads

- `POST /api/checkout` — Stripe Checkout when `STRIPE_SECRET_KEY` is set; otherwise mock checkout with `cs_mock_*` sessions
- `POST /api/webhooks/stripe` — verifies `STRIPE_WEBHOOK_SECRET` and completes purchases idempotently
- `GET /api/checkout/complete?session_id=` — success redirect target after payment
- `GET /api/download/[assetId]` — returns a short-lived `signedUrl` for `GET /api/files/signed?token=...` (logs download on signed consumption)

## Security baseline

- Hardened headers and `/admin` HTML protection via `apps/web/proxy.ts` (Next.js 16 “Proxy”; see `docs/SECURITY_HARDENING.md`)
- Owner session cookie backed by DB `Session` rows
- Audit log API: `GET /api/admin/audit-logs` (owner), UI at `/admin/audit`
- Private route and upload flows are scaffolded with zero-trust defaults

## Future hosting

When you purchase hosting, deploy `apps/web` as a standard Node Next.js app: build with `pnpm build:web`, run `pnpm start:web`, set env vars on the provider, and use a managed **PostgreSQL** (or your chosen DB) with `DATABASE_URL`. Run `prisma migrate` or `prisma db push` according to your migration strategy. See `infra/.env.example` for a Postgres-oriented example.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
