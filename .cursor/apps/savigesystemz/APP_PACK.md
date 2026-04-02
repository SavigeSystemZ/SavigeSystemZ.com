# SavigeSystemZ.com — Cursor / AI app pack

**Workspace root:** `SavigeSystemZ.com` (this repository).

**Rule files (physical location):** `../../rules/ssz-*.mdc` (i.e. `.cursor/rules/` at repo root).

This folder is a **manifest only** so multiple apps under `MyAppZ/` can each have `.cursor/apps/<appname>/` without mixing rule bodies. **Do not** duplicate `.mdc` content here — single source of truth is `.cursor/rules/ssz-*.mdc`.

## Pack contents

| ID | File | alwaysApply | globs |
|----|------|-------------|-------|
| 01 | `ssz-01-monorepo.mdc` | yes | — |
| 02 | `ssz-02-apps-web.mdc` | no | `apps/web/**/*` |
| 03 | `ssz-03-prisma.mdc` | no | `apps/web/prisma/**/*` |
| 04 | `ssz-04-security-web.mdc` | no | `apps/web/app/api/**/*` |

## Agent docs

- Repo root: `AGENTS.md`
- Web app: `apps/web/AGENTS.md`
