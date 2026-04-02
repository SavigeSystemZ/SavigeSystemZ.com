# AGENTS — SavigeSystemZ.com

Human and AI coding agents: read this before large changes.

## Where rules live

| Location | Purpose |
|----------|---------|
| `.cursor/rules/ssz-*.mdc` | Cursor project rules (namespaced **SavigeSystemZ** pack; see `.cursor/README.md`) |
| `.cursor/apps/savigesystemz/APP_PACK.md` | Index of the same rule pack |
| `apps/web/AGENTS.md` | Next.js app–specific agent notes |
| `_ai_operating_system/` | **`SESSION_RECALL.md`** (full checklist), **`WHERE_LEFT_OFF.md`** (pulse), **`TODO.md`**, **`VISION_AND_ROADMAP.md`** |
| `docs/DATABASE.md` | Migrations, seed, Postgres path |
| `docs/SECURITY_HARDENING.md` | Threat model and enforced controls |

## Non-negotiables

1. **No trust of client `x-user-*` headers** for auth (session + DB only).
2. **Migrations** over ad-hoc `db push` for anything beyond throwaway local experiments.
3. **`pnpm check:all`** green before merging substantive changes.
4. **Secrets** never committed; `.env.example` stays example-only.

## Commands (short)

```bash
pnpm install
pnpm check:all
pnpm --filter web test:e2e   # with DATABASE_URL + owner env — see README
```

## Cursor / IDE

- Rules use `.mdc` frontmatter (`alwaysApply` or `globs`). Edit under `.cursor/rules/` (`ssz-*` files) to teach future sessions project conventions.
- **Open this repo** (`SavigeSystemZ.com`) as the workspace root — not the parent `~/.MyAppZ` folder — so rules load correctly; see `.cursor/README.md` and `~/.MyAppZ/.cursor/rules/myappz-00-myappz-root.mdc` for multi-app layouts.
- `.vscode/settings.json` enables format-on-save and ESLint fixes when the recommended extensions are installed.
