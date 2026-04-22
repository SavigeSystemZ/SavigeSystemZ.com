# Where Left Off

- **Timestamp:** 2026-04-22 (end-of-night wrap; owner is testing the site in the morning)
- **Status:** Code module (M10) scaffold committed and green across all gates; canonical dev port 43907 wired end-to-end; AI operating system refreshed.
- **Latest commit:** `68e2f46` — `feat: Code module (M10) scaffold + canonical dev port 43907`
- **Pushed to remote:** yes — `git@github.com:SavigeSystemZ/SavigeSystemZ.com.git` branch `main`.

## Quality gates (this session, against Postgres)

| Gate | Result |
|------|--------|
| Unit tests | **121 / 121** pass (10 new in `tests/unit/code-repository.test.ts` + `tests/unit/github-client.test.ts`) |
| E2E tests  | **62 pass / 1 pre-existing skip / 0 fail** (6 new in `tests/e2e/admin-code.spec.ts`) |
| ESLint     | clean |
| `tsc --noEmit` | clean |
| `pnpm build:web` | succeeds; `/admin/code`, `/api/admin/code`, `/api/admin/code/[id]` present in the route table |
| Migration `0002_code_repository` | applied against local Postgres (`postgresql://ssz:dev@localhost:5433/savige`) |

## Verification of owner's stated scope

| Statement | Status | Evidence |
|-----------|--------|----------|
| Hosts and sells apps | ✅ | `Application` / `License` / `Purchase` models, Stripe checkout + webhooks, signed downloads |
| Displays other accomplishments / works | ✅ | `ArchiveEntry` model, `/archive` public routes, admin archive manager |
| Admin-only area to assist owner's work | ✅ | `app/(admin)/admin/*` gated by `requireOwner()`; admin HTML also gated at `proxy.ts` |
| Store code like GitHub + connect to GitHub | 🟡 scaffold shipped | Admin `/code` panel: connect a repo by `owner/repo` or URL, sync metadata + latest commit, remove. Full self-hosted git storage = M11 (not started) |
| Desktop icon opens this site (not Immortality) | ✅ fixed | `~/Desktop/SavigeSystemZ-local.desktop` re-pointed from 3000 → 43907 |
| Unique non-standard random port | ✅ | Canonical **43907** + `SITE_PORT` override + random fallback (43000–44999) in `scripts/dev-web.mjs` |

## Ready for owner to test (tomorrow)

1. `./scripts/dev-postgres.sh` (Postgres container is already up on `localhost:5433`; if it was stopped, that script will start it, apply migrations, seed, and launch dev server on port 43907)
2. Open **http://127.0.0.1:43907/** via the desktop icon or browser
3. Log in as owner → navigate to **`/admin/code`**
4. Connect a GitHub repo — try `SavigeSystemZ/SavigeSystemZ.com` (or any public repo like `octocat/Hello-World`)
5. Confirm: name / description / stars / branch / latest commit populate, Sync re-fetches, Remove untracks, Audit log records all three actions at `/admin/audit`

## What should be done next (owner-facing priorities)

| # | Item | Why | Effort |
|---|------|-----|--------|
| 1 | Link `CodeRepository` to `Application` (1:N) | So an app's public detail page can surface its source repo, README, and latest commit | S |
| 2 | Public `/repos/[slug]` detail page (README render for PUBLIC repos) | Closes the "displays my works" loop for code-heavy projects | M |
| 3 | Visibility toggle UI in `/admin/code` | Currently only settable via DB / API; owner should be able to flip DRAFT ↔ PUBLIC from the panel | S |
| 4 | "Sync all" batch action | Avoid clicking Sync per-row | S |
| 5 | GitHub webhook intake | Auto-sync on push; removes the manual Sync click | M |
| 6 | E2E happy-path test (mocked GitHub API) | Lock in connect-success behavior without flaking on live GitHub | S |

## What could be done (opportunistic / later)

- **M11 self-hosted storage:** Gitea sidecar vs. S3-mirrored bare-repo — capture decision in `docs/CODE_STORAGE.md`.
- **Dependency / SBOM surfacing** per tracked repo (`package.json` / `Cargo.toml` / etc. scan on sync).
- **Code search** across all tracked repos (trigram index in Postgres or Tantivy).
- **Release tagging:** link GitHub Releases → existing `ApplicationVersion` / `ReleaseAsset` pipeline.
- **Contributors view:** pull `GET /repos/:owner/:repo/contributors` into a bio surface.

## Blocked — needs external input (unchanged from 2026-04-06)

| Item | What's needed |
|------|---------------|
| Owner S3 uploads | AWS creds + bucket |
| Live Stripe staging | `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` |
| Domain routing | Vercel DNS attach for `savigesystemz.com` |
| S3 vault scan Lambda deploy | AWS Lambda deploy access |
| Private-repo sync on `/admin/code` | Populate `GITHUB_TOKEN` in `apps/web/.env.local` (optional — public repos work without it) |

## Intentionally uncommitted (pre-session working-tree changes)

Review at your pace:
- `.gitignore`, `apps/web/app/(public)/applications/page.tsx`, `apps/web/app/(public)/page.tsx`, `apps/web/app/globals.css`, `apps/web/app/layout.tsx`
- Untracked: `.ai/` (AIAST-style scratch), `.cursor/rules/00-ai-context.mdc`, `.github/copilot-instructions.md`, `GEMINI.md`

## Full recall

`SESSION_RECALL.md` — full done/not-done checklist.

## Handoff to next session

1. Read this file + `SESSION_RECALL.md` + `TODO.md` (in that order)
2. Check Postgres is up: `docker compose -f docker-compose.postgres.yml ps`
3. Check desktop launcher still targets 43907 (if not, re-run `installer/desktop/install-desktop-launcher.sh`)
4. Pick from the "What should be done next" table above — item #1 (Application ↔ CodeRepository link) is the highest-leverage next step
