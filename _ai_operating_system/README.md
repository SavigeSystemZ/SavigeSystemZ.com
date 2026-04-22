# AI Operating System Layer

Planning, execution, risk tracking, and handoff context for AI agents working on SavigeSystemZ.com. Kept separate from website runtime code.

## Directory contents

| File | Purpose | Read when |
|------|---------|-----------|
| `WHERE_LEFT_OFF.md` | Short pulse — timestamp, status, next steps | **Every session start** |
| `SESSION_RECALL.md` | Full done/not-done checklist | **Every session start** |
| `TODO.md` | Prioritized action items (P0/P1/P2) | **Every session start** |
| `PLAN.md` | Current execution phase and constraints | Starting new work phase |
| `VISION_AND_ROADMAP.md` | Pillars and near-term roadmap | Planning or scoping |
| `PROMPT_PACK.md` | Milestone prompts M0-M9 with scope and verification | Starting milestone work |
| `RISK_REGISTER.md` | Active risks and mitigations | Before risky changes |
| `TEST_STRATEGY.md` | Testing layers, commands, coverage gaps | Adding or reviewing tests |
| `VALIDATION_LOG.md` | History of quality gate runs | After running `pnpm check:all` |
| `PATTERNS.md` | Canonical code patterns for common tasks | When writing new routes, pages, tests |
| `TROUBLESHOOTING.md` | Common issues and solutions | When encountering errors |
| `SESSION_CHANGELOG.md` | Per-session changes to AI system files with AIAST harvest guidance | After modifying AI system files; when syncing with AIAST master template |

## Rules

- Do not couple these files to app runtime imports.
- Keep milestone state current after each implementation pass.
- Treat docs in `docs/` as product source-of-truth for architecture decisions.
- Update `WHERE_LEFT_OFF.md` and `SESSION_RECALL.md` at end of every work session.

## Companion system files (outside this directory)

| File | Location | Purpose |
|------|----------|---------|
| `CLAUDE.md` | repo root | Root instructions for all AI agents |
| `CLAUDE.md` | `apps/web/` | Web-app-specific AI agent quick reference |
| `AGENTS.md` | repo root | Agent entrypoint — rules locations, non-negotiables, commands |
| `AGENTS.md` | `apps/web/` | Web app stack, file map, PR checklist |
| `.cursor/rules/ssz-*.mdc` | `.cursor/rules/` | Cursor project rules (4 files) |
| `CLAUDE.md` | `.claude/projects/` | Claude Code project-level instructions |
| `memory/` | `.claude/projects/` | Claude Code persistent memory |

## Milestone-aligned product docs (in `docs/`)

Added 2026-04-22 as M0 scaffolding for upcoming milestones. Each is a stub owned by the milestone that fills it.

| Doc | Owner milestone | Status |
|-----|-----------------|--------|
| `docs/UX_SYSTEM.md` | M1 — Design-system upgrade | Stub; current tokens + motion inventory + reduced-motion gap |
| `docs/AI_INTEGRATION_STRATEGY.md` | M6 — Agentic AI split | TOC-only stub |
| `docs/CODE_STORAGE.md` | M11 — Self-hosted code storage | Current state + decision matrix, decision pending |
| `docs/DEV_ENV_GOTCHAS.md` | Rolling | `DATABASE_URL` inheritance, prisma regen, scan-status sync, 43907 vs 3000 |

See `PROMPT_PACK.md` Part II for the refined, paste-ready session prompt for each milestone.
