# SavigeSystemZ.com

Flagship software-foundry website and operations platform, built as a Next.js monorepo.

**License:** [MIT](LICENSE) — open source; use and modify under the terms of that license.

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

- **`SITE_URL`** — e.g. `http://127.0.0.1:3000` for local browsing.
- **`DATABASE_URL`** — for local development, SQLite is fine. The example uses `file:./dev.db`; Prisma resolves this **relative to the `prisma/` folder**, so the file is created at `apps/web/prisma/dev.db`.
- **`OWNER_ACCESS_CODE`** / **`OWNER_LOGIN_SECRET`** — set long random strings for owner login at `/owner/login`.
- **Passkeys (optional locally):** for `http://127.0.0.1:3000`, align WebAuthn with your origin, for example:
  - `PASSKEY_RP_ID=127.0.0.1`
  - `PASSKEY_ORIGIN=http://127.0.0.1:3000`

Apply the schema and start the dev server:

```bash
cd apps/web
pnpm exec prisma generate
pnpm exec prisma db push
cd ../..
pnpm dev:web
```

Open **http://127.0.0.1:3000** (or the host/port shown in the terminal).

**Production-style run on the host** (after a successful build):

```bash
pnpm build:web
pnpm start:web
```

Use the same `apps/web/.env.local` (or production env vars) and ensure `DATABASE_URL` points at your real database for production.

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
pnpm --filter web test:e2e
```

Set `CI=1` for E2E if you want Playwright to always start a dedicated dev server (see `apps/web/playwright.config.ts`).

## Commerce and downloads

- `POST /api/checkout` — Stripe Checkout when `STRIPE_SECRET_KEY` is set; otherwise mock checkout with `cs_mock_*` sessions
- `POST /api/webhooks/stripe` — verifies `STRIPE_WEBHOOK_SECRET` and completes purchases idempotently
- `GET /api/checkout/complete?session_id=` — success redirect target after payment
- `GET /api/download/[assetId]` — returns a short-lived `signedUrl` for `GET /api/files/signed?token=...` (logs download on signed consumption)

## Security baseline

- Hardened headers via `proxy.ts`
- Owner session cookie backed by DB `Session` rows
- Audit log API: `GET /api/admin/audit-logs` (owner), UI at `/admin/audit`
- Private route and upload flows are scaffolded with zero-trust defaults

## Future hosting

When you purchase hosting, deploy `apps/web` as a standard Node Next.js app: build with `pnpm build:web`, run `pnpm start:web`, set env vars on the provider, and use a managed **PostgreSQL** (or your chosen DB) with `DATABASE_URL`. Run `prisma migrate` or `prisma db push` according to your migration strategy. See `infra/.env.example` for a Postgres-oriented example.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
