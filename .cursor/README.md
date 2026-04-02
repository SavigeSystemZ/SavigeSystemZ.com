# Cursor — SavigeSystemZ.com (workspace-local)

## Scope (no overlap with other apps)

Cursor loads rules from **this folder’s parent** as the **workspace root**. For full rule application:

1. **Recommended:** In Cursor, **File → Open Folder** and select **`SavigeSystemZ.com`** (this repo), **not** the parent `MyAppZ` folder.

2. **If you open `MyAppZ` as root:** This repo’s rules are **not** loaded unless you use a multi-root workspace that includes `SavigeSystemZ.com` as a folder. Prefer opening each app separately, or use the parent-level rules in `~/.MyAppZ/.cursor/rules/`.

## Rule files (`rules/ssz-*.mdc`)

| File | Purpose |
|------|---------|
| `ssz-01-monorepo.mdc` | Always on — monorepo commands, CI, DB discipline |
| `ssz-02-apps-web.mdc` | When editing `apps/web/**` |
| `ssz-03-prisma.mdc` | When editing `apps/web/prisma/**` |
| `ssz-04-security-web.mdc` | When editing `apps/web/app/api/**` |

The **`ssz-` prefix** = **SavigeSystemZ** pack; avoids clashing with rule files from other repos if files are ever merged or copied.

## App pack manifest

See **`.cursor/apps/savigesystemz/APP_PACK.md`** for a human-readable index of the same pack.

## Shared templates (all apps)

Host-agnostic and Cursor/Windsurf templates live under **`~/.MyAppZ/_AI_AGENT_SYSTEM_TEMPLATE/`** — do not delete; copy from `TEMPLATE/` when bootstrapping new projects. See `TEMPLATE/.cursor/README.md` and `TEMPLATE/_system/CURSOR_AND_MULTI_HOST.md`.
