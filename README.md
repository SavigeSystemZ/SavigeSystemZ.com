# SavigeSystemZ.com — `meta-system` branch

This orphan branch is a **standalone snapshot of the AI-agent meta system** that
drives work on `SavigeSystemZ.com`. It shares no history with `main` and is
not intended to be merged. It exists so the AI operating system has a remote
backup that is independent of the website codebase on `main`.

## What lives here

| Path | Purpose |
|------|---------|
| `_ai_operating_system/` | Session handoff, plan, validation log, prompt pack, risk register, TODO, troubleshooting, patterns |
| `.ai/` | AIAST-style scratch — current project status and portable project rules |
| `.cursor/` | Cursor project rules (monorepo / web / prisma / security) + app rule pack |
| `.github/copilot-instructions.md` | GitHub Copilot project instructions |
| `GEMINI.md` | Gemini-family agent project instructions |
| `CLAUDE.md` (root) | Root Claude Code instructions for the repo |
| `apps/web/CLAUDE.md` | Web-app quick reference for Claude Code |
| `AGENTS.md` (root) | Repo-wide agent entrypoint |
| `apps/web/AGENTS.md` | Web-app stack, file map, vault limits, PR checklist |
| `CONTRIBUTING.md` | PR guidelines |

## How to resume work from this branch

On this branch you have the **instructions** for agents, but not the **code**
they would act on. To start a working session, check out `main` (the website)
and use this branch only as a reference mirror:

```bash
git fetch origin
git checkout main
# read _ai_operating_system/WHERE_LEFT_OFF.md on main
# then SESSION_RECALL.md and TODO.md
```

This branch is updated by explicit snapshot pushes — it is not a live working
branch. See the commit log for dated snapshots.
