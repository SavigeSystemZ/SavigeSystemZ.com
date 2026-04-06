# SavigeSystemZ — `apps/web`

Next.js application (App Router). **License:** MIT (see repository root `LICENSE`).

## Quick start (from monorepo root)

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
# Edit apps/web/.env.local — see root README for field notes
cd apps/web && pnpm exec prisma generate && pnpm exec prisma migrate deploy && pnpm exec prisma db seed && cd ../..
pnpm dev:web
```

Browse to the URL in the terminal (`.env.example` uses **http://127.0.0.1:43907**; dev may auto-pick a port—keep `SITE_URL` and passkey origins aligned). For passkeys on localhost, set `PASSKEY_RP_ID` and `PASSKEY_ORIGIN` to match that origin.

## Scripts (run inside `apps/web` or via `pnpm --filter web <script>`)

| Script | Purpose |
|--------|---------|
| `pnpm dev` | Next.js dev server |
| `pnpm build` / `pnpm start` | Production build and server |
| `pnpm prisma:generate` | Regenerate Prisma Client |
| `pnpm prisma:deploy` | Apply SQL migrations (`migrate deploy`) |
| `pnpm prisma:seed` | Seed demo catalog rows |
| `pnpm prisma:push` | Emergency dev sync only — prefer `migrate deploy` |
| `pnpm test` | Vitest unit tests |
| `pnpm test:e2e` | Playwright (set `CI=1` for clean server) |

## Environment

Copy `.env.example` to `.env.local`. Never commit real secrets or `*.db` files.

## Deploying later

Build the app, provide `DATABASE_URL` and secrets on your host, run migrations or `db push` as appropriate, then `pnpm start`. The root `README.md` has hosting notes.
