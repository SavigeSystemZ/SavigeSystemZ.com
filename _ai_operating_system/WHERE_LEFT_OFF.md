# Where Left Off

- **Timestamp:** 2026-04-22
- **Status:** Canonical dev port wired, desktop launcher fixed, Code module scaffold landed (M10 kickoff). Prior M9 work unchanged.
- **Commits this session:** Pending — changes are staged/unstaged in the working tree; owner to review and commit.
- **Quality gates:** `tsc --noEmit` + ESLint clean on new files. Migration `0002_code_repository` is written but not yet applied (requires running Postgres).
- **Git:** `git@github.com:SavigeSystemZ/SavigeSystemZ.com.git` — no push yet this session.

## Completed this session

| Item | Details |
|------|---------|
| **Canonical dev port** | 43907 wired into `scripts/dev-web.mjs` (prefers `SITE_PORT` env → 43907 → random fallback 43000–44999) |
| **Desktop launcher fix** | `~/Desktop/SavigeSystemZ-local.desktop` now targets `http://127.0.0.1:43907/` (was 3000 = Immortality app collision). Installer template `installer/desktop/SavigeSystemZ-local.desktop.in` updated to match |
| **Code module (M10 scaffold)** | `CodeRepository` Prisma model + migration `0002_code_repository`, `lib/github-client.ts`, `lib/code-repository.ts`, `app/api/admin/code/route.ts`, `app/api/admin/code/[id]/route.ts`, `app/(admin)/admin/code/page.tsx`, `components/admin/code-panel.tsx`, admin nav link, `.env.example` additions (`SITE_PORT`, `GITHUB_TOKEN`) |
| **Meta-system polish** | `.ai/CURRENT_STATUS.md` rewritten, `WHERE_LEFT_OFF.md` / `SESSION_RECALL.md` / `TODO.md` / `PLAN.md` / `VISION_AND_ROADMAP.md` / `PROMPT_PACK.md` / `SESSION_CHANGELOG.md` / root `CLAUDE.md` / `apps/web/AGENTS.md` updated to reflect port + Code module |

## Verification of owner's stated scope

| Statement | Implemented? | Evidence |
|-----------|--------------|----------|
| Hosts and sells apps | ✅ | `Application` / `License` / `Purchase` Prisma models, Stripe checkout + webhook, signed downloads, entitlements |
| Displays other accomplishments | ✅ | Archive system (`ArchiveEntry` model, public `/archive` routes, admin archive manager) |
| Admin-only area | ✅ | `app/(admin)/admin/*` gated by `requireOwner()`; admin HTML also gated at `proxy.ts` |
| Store code like GitHub & connect to GitHub | 🟡 scaffold | Code module landed (model + API + admin UI + GitHub metadata sync). Full self-hosted git storage is a future milestone (M11 — see VISION roadmap) |
| Desktop icon opens this site | ✅ (fixed) | Launcher now at 43907; user to relaunch / re-trust if KDE/Plasma prompts |
| Unique non-standard random port | ✅ | 43907 chosen; outside 3000/3001/5173/8080 and outside common dev ranges |

## Blocked — needs external input

| Item | What's needed |
|------|---------------|
| Apply Code migration | Start Postgres (`scripts/dev-postgres.sh`), run `pnpm --filter web prisma migrate deploy` |
| Private repo sync | Populate `GITHUB_TOKEN` in `apps/web/.env.local` |
| S3 bucket wiring, Stripe live keys, domain, Lambda deploy | Unchanged from 2026-04-06 handoff — owner credentials still needed |

## Next steps

1. Apply the new migration and do a manual round-trip (connect → sync → remove) via `/admin/code`
2. Add unit tests (`tests/unit/code-repository.test.ts`) and E2E coverage (`tests/e2e/admin-code.spec.ts`)
3. Commit as `feat(code): scaffold GitHub-connected Code module + canonical dev port`
4. Begin M11 scoping: self-hosted git storage backend

## Full recall

`SESSION_RECALL.md` — full done/not-done checklist.
