# Troubleshooting Guide

Common issues AI agents encounter when working on SavigeSystemZ.com and their solutions.

## Build / Dev Server

### `Environment variable not found: DATABASE_URL`
**Cause:** Prisma CLI doesn't auto-load `.env.local`.
**Fix:** Prefix commands: `DATABASE_URL="file:./dev.db" pnpm exec prisma migrate deploy`
Or ensure you're running from the `apps/web/` directory with `.env.local` present.

### `pnpm dev:web` port already in use
**Cause:** The dev script auto-selects a port, but sometimes a previous process lingers.
**Fix:** `lsof -ti:PORT | xargs kill` or just let the script pick another port. Check the terminal output for the actual URL.

### `Module not found: @/lib/...`
**Cause:** Path alias `@/` resolves to `apps/web/`. Running from wrong directory or missing tsconfig paths.
**Fix:** Ensure you're working within the `apps/web/` context. Check `tsconfig.json` paths.

### Build fails with Prisma-related error at `next build`
**Cause:** `next build` runs SSG and tries to execute Prisma queries without a database.
**Fix:** Add `export const dynamic = "force-dynamic"` to any page/route that uses Prisma.

## Database

### `prisma migrate deploy` shows no pending migrations but schema is wrong
**Cause:** Migrations applied but client not regenerated.
**Fix:** `DATABASE_URL="file:./dev.db" pnpm exec prisma generate`

### SQLite constraint violation during seed
**Cause:** Seed script isn't fully idempotent, or schema drifted.
**Fix:** Delete `apps/web/prisma/dev.db`, then: `prisma migrate deploy && prisma db seed`

### `PrismaClientInitializationError`
**Cause:** Missing `prisma generate`, or wrong `DATABASE_URL`.
**Fix:** Run `pnpm exec prisma generate` from `apps/web/`.

## Auth

### Admin routes return 401 even with correct owner code
**Cause:** Session cookie not set or expired.
**Fix:** Log in via `/owner/login` with `OWNER_ACCESS_CODE`. Check that `OWNER_LOGIN_SECRET` is set in `.env.local`.

### `getAuthContext` returns null
**Cause:** No `sz_session` cookie, or session row deleted from DB.
**Fix:** Re-login. Check that the session table has rows.

## Testing

### Playwright tests fail with `ECONNREFUSED`
**Cause:** Dev server not running or wrong port.
**Fix:** Set `CI=1` so Playwright auto-starts a dev server. Ensure `DATABASE_URL` is set.

### Vitest `Cannot find module` errors
**Cause:** Dependencies not installed or Prisma client not generated.
**Fix:** `pnpm install && cd apps/web && pnpm exec prisma generate`

## Stripe

### Webhook returns 501
**Cause:** `STRIPE_WEBHOOK_SECRET` not set — this is the expected dev behavior.
**Fix:** For real webhook testing, set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`. See `docs/STRIPE_WEBHOOK_TESTING.md`.

### Mock checkout returns `cs_mock_*` session
**Cause:** `STRIPE_SECRET_KEY` not set — mock mode is active.
**Fix:** This is correct for local dev. Real checkout requires Stripe keys.

## S3

### Upload routes return 501
**Cause:** S3 bucket env vars not configured.
**Fix:** Set `AWS_S3_RELEASE_BUCKET`, `AWS_S3_MEDIA_BUCKET`, and/or `AWS_S3_VAULT_BUCKET` with AWS credentials. This is expected pre-production.

## Common mistakes

| Mistake | Correct approach |
|---------|-----------------|
| Creating `middleware.ts` | Use `proxy.ts` (Next.js 16) |
| Using `node:crypto` | Use `lib/hmac-web.ts` (Web Crypto) |
| Trusting `x-user-*` headers | Use `getAuthContext()` |
| `prisma db push` for shared changes | Use `prisma migrate dev` |
| Importing `PrismaClient` directly | Import `db` from `@/lib/db` |
| Hardcoding port 3000 | `pnpm dev:web` auto-selects port |
| Running prisma without DATABASE_URL | Prefix with `DATABASE_URL="file:./dev.db"` |
