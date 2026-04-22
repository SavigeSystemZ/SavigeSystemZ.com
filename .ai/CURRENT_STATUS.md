# Current Project Status

- **Last Updated**: 2026-04-22 (end-of-night wrap) by Claude Code (Opus 4.7)
- **Primary working directory**: `/home/whyte/.MyAppZ/SavigeSystemZ.com`
- **Current phase**: M9 closing, **M10 (Code module) scaffold landed + green**; M11 scoped
- **Canonical local dev URL**: http://127.0.0.1:43907/
- **Git**: `origin/main` at commit **`68e2f46`** (pushed)
- **Next session owner**: user resumes after testing tomorrow

## Current objective (completed)
Scaffold the Code/GitHub module, wire a canonical dev port + correct desktop launcher, refresh the AI operating system, verify all gates, commit, push, stop for the night.

## Recently completed (this session)
- Canonical dev port 43907 end-to-end (`scripts/dev-web.mjs`, `.env.example`, desktop launcher, installer template)
- Desktop icon no longer opens the Immortality app (was port 3000)
- Code module M10 scaffold — Prisma model + migration `0002_code_repository` (**applied to Postgres**), `lib/github-client.ts`, `lib/code-repository.ts`, admin APIs, admin `/code` page, nav link, env vars
- 10 new unit tests + 6 new E2E tests — all green
- Full suite: **121/121 unit**, **62 E2E / 1 skip / 0 fail**, lint + typecheck + build clean
- AI operating system refresh across `_ai_operating_system/`, root `CLAUDE.md`, `apps/web/AGENTS.md`, persistent memory
- Commit `68e2f46` pushed to `origin/main`

## Next steps (picking up tomorrow, priority order)
1. Manual browser round-trip on `/admin/code` (connect owner's own GitHub repo, confirm UX)
2. Link `Application` ↔ `CodeRepository` (1:N relation) — surface source on app detail pages
3. Public `/repos/[slug]` detail page with README render for PUBLIC repos
4. Visibility toggle + "Sync all" batch action in the admin panel
5. GitHub webhook receiver (`/api/webhooks/github`) with HMAC verification → auto-sync on push

## Blocked / awaiting external input
- S3 creds, Stripe live keys, domain DNS, Lambda deploy (unchanged from 2026-04-06 handoff)
- Optional: populate `GITHUB_TOKEN` in `apps/web/.env.local` to sync private repos or raise the GitHub anonymous rate limit (60 req/hr)

## Re-entry checklist (next session)
1. Read `_ai_operating_system/WHERE_LEFT_OFF.md` — short pulse
2. Read `_ai_operating_system/SESSION_RECALL.md` — full checklist
3. Read `_ai_operating_system/TODO.md` — priorities
4. `docker compose -f docker-compose.postgres.yml ps` — confirm Postgres container still up
5. `pnpm dev:web` — should bind to 43907
6. Open the desktop icon → should land on `http://127.0.0.1:43907/`
