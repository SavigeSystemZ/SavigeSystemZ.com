# Dev environment gotchas

Running-list of non-obvious local-dev traps that have bitten a session at least once. Add new entries with a date and a one-line root cause.

## DATABASE_URL inheritance through `pnpm` / `spawn`

**Symptom:** `pnpm dev:web` works with the right Postgres URL in `apps/web/.env.local`, but Prisma still validates against `file:./dev.db` or against some other inherited URL.

**Root cause:** a parent process (an earlier shell, a launcher script, a previous dev run) set `DATABASE_URL` in the environment. When `scripts/dev-web.mjs` passes `process.env` into `spawn({ env })`, that inherited value beats `apps/web/.env.local`.

**Fix on disk:** `scripts/dev-web.mjs` no longer hard-codes `DATABASE_URL` in the child env (fixed in commit `c70ab8c`, 2026-04-22). `.env.local` wins now.

**If it still happens to you:**

```bash
env -u DATABASE_URL pnpm dev:web
```

Or verify the shell:

```bash
echo "$DATABASE_URL"   # should be empty or match .env.local
```

## Always `prisma generate` + restart dev server after `schema.prisma` changes

**Symptom:** new model / field exists in `schema.prisma` but TypeScript or runtime says "property does not exist on Prisma client".

**Root cause:** Next's module cache holds the stale Prisma client. `prisma migrate dev` regenerates the client on most paths, but `prisma db push` and hand-edits do not. The dev server must also be restarted because the already-loaded client stays in memory.

**Fix:**

```bash
cd apps/web
pnpm exec prisma generate
# then stop the dev server (Ctrl-C) and restart
pnpm dev:web
```

## ClamAV scan status is not yet mirrored into `VaultArtifact`

**Symptom:** a vault upload completes, the Lambda scans it, but `/admin/vault/[id]` shows no scan result.

**Root cause:** the S3 vault scan Lambda currently tags the S3 object + emits SNS, but does not call back into the app to update `VaultArtifact.scanStatus`. The DB row never knows the outcome.

**Fix pending:** tracked as M3 Phase 1 in `_ai_operating_system/PROMPT_PACK.md`. Adds `VaultArtifact.scanStatus` + `/api/vault/[id]/scan-report` HMAC endpoint + Lambda callback.

## Canonical dev port is 43907 (not 3000)

**Symptom:** desktop launcher opens the wrong app; a stray process on port 3000 collides with the local Immortality app.

**Root cause:** Next.js default port is 3000. We override to 43907 (random-high, collision-free against the shared dev machine) in `scripts/dev-web.mjs` and in `apps/web/.env.example`.

**Fix:** use `pnpm dev:web` (not `pnpm --filter web dev`). To force a different port: `SITE_PORT=<port> pnpm dev:web`.

---

## Anti-example — do not use

The following `DATABASE_URL` appears **only in this file** as an anti-pattern. Any other occurrence in `docs/`, `README.md`, `CLAUDE.md`, or `apps/web/AGENTS.md` is a drift to fix:

```
DATABASE_URL=file:./dev.db
```

Use Postgres (`postgresql://ssz:dev@localhost:5433/savige`) instead. See `docs/DATABASE.md`.
