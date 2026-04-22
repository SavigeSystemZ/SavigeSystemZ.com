# Where Left Off

- **Timestamp:** 2026-04-22 (mid-day continuation; owner returned, rate-limit reset, asked to continue best-possible work on the site)
- **Status:** Application ↔ CodeRepository relation (priority-1 follow-up to M10) shipped end-to-end — schema + migration + admin API + admin UI + public surface + tests. All gates green against Postgres.
- **Latest commit on disk:** uncommitted working tree as of this file being written. Previous session landed `68e2f46` (M10 scaffold). This session's changes are staged for the owner's review / commit.

## Quality gates (this session, against Postgres)

| Gate | Result |
|------|--------|
| Unit tests | **124 / 124** pass (3 new in `tests/unit/code-repository.test.ts` covering `setCodeRepositoryApplicationLinks`) |
| ESLint | clean |
| `tsc --noEmit` | clean (includes fix to `tests/unit/concierge.test.ts` KnowledgeBase fixture for new `codeRepository: null` field) |
| `pnpm build:web` | ✓ Compiled successfully — `/admin/code`, `/applications/[slug]`, `/api/admin/code/[id]` all in the route table |
| Migration `0003_application_code_repository_link` | applied against local Postgres (`postgresql://ssz:dev@localhost:5433/savige`) |
| Desktop launcher | `desktop-file-validate` clean, `gio launch` exit 0, xdg-open routes through Vivaldi |
| Runtime smoke | `/`, `/applications`, `/applications/[slug]`, `/archive`, `/api/catalog`, `/api/health` → 200 |

## What shipped this session

1. **Migration `0003_application_code_repository_link`** — adds `Application.codeRepositoryId` (optional FK, `onDelete: SetNull`) + `@@index([codeRepositoryId])`; adds `applications[]` back-relation on `CodeRepository`. Applied against Postgres.
2. **`lib/code-repository.ts`** — new `setCodeRepositoryApplicationLinks(repoId, applicationIds)` (transactional: unlinks anything no longer in the set, then links the requested ids); new `listApplicationsForLinking()` helper; `listCodeRepositories()` now `include: { applications: {...} }`.
3. **Admin API**:
   - `GET /api/admin/code` now returns `{ items, applications }` so the UI can populate the linker.
   - `PATCH /api/admin/code/[id]` accepts `{ applicationIds: string[] }` (Zod-validated, max 50), writes audit log `code.repository.link`, returns the refreshed repo with linked apps. 404 on missing repo, 400 on bad body, 403 without owner.
4. **Admin UI (`components/admin/code-panel.tsx`)** — per-repo "Link apps" button opens a checkbox editor; existing links rendered as pill list; "currently linked elsewhere" warning when an app is owned by a different repo.
5. **Public surface** — `getPublicApplicationWithReleasesBySlug` now includes `codeRepository`; `/applications/[slug]` renders a "Source code" card (primary language, default branch, stars, open issues, latest commit, GitHub link) **only when the linked repo's visibility is `PUBLIC`**. PRIVATE/DRAFT repos never leak to anonymous visitors.
6. **Tests** — 3 unit tests cover the new lib function (missing-repo error, partial relink keeps only the requested set, empty array clears everything); 4 new E2E cases cover `PATCH` auth, 404, malformed body, and the new `applications` field on `GET`.
7. **Dev-server env fix** — `scripts/dev-web.mjs` used to set `DATABASE_URL: process.env.DATABASE_URL?.trim() || "file:./dev.db"` in the child process, overriding `.env.local` and forcing Prisma into SQLite-protocol validation errors. Removed the override; `.env.local` now drives DATABASE_URL cleanly.
8. **`apps/web/.env.local`** — flipped `DATABASE_URL` from `file:./dev.db` → `postgresql://ssz:dev@localhost:5433/savige` so `pnpm dev:web` works out of the box against the canonical local Postgres container.
9. **`apps/web/AGENTS.md`** — Stack + PR checklist lines updated from SQLite to Postgres; Code module section documents the new `PATCH` route and the `Application.codeRepositoryId` relation.
10. **Desktop launcher** — `Categories=Network;Development;` raised a freedesktop hint (two main categories). Changed to `Categories=Development;WebDevelopment;` in the template and re-installed. Validated with `desktop-file-validate`, `gio info` (metadata::trusted=true), and `gio launch` (exit 0 → Vivaldi → dev server).

## Ready for owner to test

1. Dev server is already running on **http://127.0.0.1:43907/** (background process; kill with `pkill -f "next dev --hostname 127.0.0.1 --port 43907"` if it needs a clean restart).
2. Desktop icon at `~/Desktop/SavigeSystemZ-local.desktop` is trusted, valid, and verified to launch the site.
3. Log in as owner → **`/admin/code`** → connect a repo (or re-use one already tracked) → click **Link apps** → pick which Application(s) should advertise that repo → Save. Audit log records the change at `/admin/audit`.
4. Visit the corresponding public **`/applications/[slug]`** page — the "Source code" card should appear below the Build-stack section (only if the repo's visibility is `PUBLIC` in the admin panel).

## What should be done next (ordered by leverage)

| # | Item | Why | Effort |
|---|------|-----|--------|
| 1 | Visibility toggle UI in `/admin/code` | Repo visibility currently only flippable via DB / API; owner should be able to flip DRAFT ↔ PUBLIC from the panel so the public "Source code" card can actually appear without a DB poke | S |
| 2 | Public `/repos/[slug]` detail page (README render for PUBLIC repos) | Closes the "displays code works" loop for code-heavy projects | M |
| 3 | "Sync all" batch action | Avoid clicking Sync per-row once several repos are tracked | S |
| 4 | GitHub webhook intake (`/api/webhooks/github`, HMAC-verified) | Auto-sync on push; removes the manual Sync click | M |
| 5 | E2E happy-path test with stubbed GitHub API | Lock in connect-success behavior without live-GitHub flake in CI | S |
| 6 | Owner manual round-trip on `/admin/code` | Verify the UX in-browser against a real GitHub repo the owner actually owns | S |

## What could be done (opportunistic / later)

- **M11 self-hosted storage:** Gitea sidecar vs. S3-mirrored bare-repo — capture decision in `docs/CODE_STORAGE.md`.
- **Dependency / SBOM surfacing** per tracked repo.
- **Code search** across all tracked repos (trigram / Tantivy).
- **Release tagging:** link GitHub Releases → existing `ApplicationVersion` / `ReleaseAsset` pipeline.
- **Contributors view:** pull `GET /repos/:owner/:repo/contributors` into a bio surface.

## Blocked — needs external input (unchanged)

| Item | What's needed |
|------|---------------|
| Owner S3 uploads | AWS creds + bucket |
| Live Stripe staging | `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` |
| Domain routing | Vercel DNS attach for `savigesystemz.com` |
| S3 vault scan Lambda deploy | AWS Lambda deploy access |
| Private-repo sync on `/admin/code` | Populate `GITHUB_TOKEN` in `apps/web/.env.local` |

## Intentionally uncommitted (pre-session working-tree changes, unchanged from last handoff)

Review at your pace:
- `.gitignore`, `apps/web/app/(public)/applications/page.tsx`, `apps/web/app/(public)/page.tsx`, `apps/web/app/globals.css`, `apps/web/app/layout.tsx`
- Untracked: `.ai/` (AIAST-style scratch), `.cursor/rules/00-ai-context.mdc`, `.github/copilot-instructions.md`, `GEMINI.md`

## Full recall

`SESSION_RECALL.md` — full done/not-done checklist.

## Handoff to next session

1. Read this file + `SESSION_RECALL.md` + `TODO.md` (in that order).
2. Check Postgres is up: `docker compose -f docker-compose.postgres.yml ps` (expect `Up (healthy)` on port 5433).
3. Check dev server is or is not running: `ss -tln | grep 43907`. If not, `pnpm dev:web` (cwd = repo root).
4. Check desktop launcher: `desktop-file-validate ~/Desktop/SavigeSystemZ-local.desktop` → no output = good.
5. Pick from the "What should be done next" table. Item #1 (visibility toggle) is the highest-leverage next step — it unlocks the public "Source code" card without the owner needing to poke the DB.
