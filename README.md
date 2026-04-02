# SavigeSystemZ.com

Flagship software-foundry website and operations platform.

## Monorepo layout
- `apps/web` - Next.js web runtime
- `packages/*` - shared domain/security/ui/ai contracts
- `services/workers` - background pipeline shell
- `_ai_operating_system` - planning, prompt packs, handoff context
- `docs` - canonical architecture and product docs
- `installer` - setup and packaging assets

## Commands
- `pnpm install`
- `pnpm dev`
- `pnpm check:all`
- `pnpm --filter web test:e2e` — Playwright (starts Next on port `3456` by default; set `CI=1` for a dedicated server)

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
