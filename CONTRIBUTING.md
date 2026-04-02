# Contributing

This project is open source under the [MIT License](LICENSE).

Before large changes, read [`AGENTS.md`](AGENTS.md), [`.cursor/README.md`](.cursor/README.md), and the namespaced rules under [`.cursor/rules/`](.cursor/rules/) (`ssz-*.mdc` — Cursor / AI context).

## Local checks

From the repository root:

```bash
pnpm install
pnpm check:all
pnpm --filter web test:e2e
```

Set `CI=1` when running Playwright if you want a clean server each run (see `apps/web/playwright.config.ts`).

## Pull requests

- Keep changes focused and match existing patterns in `apps/web`.
- Do not commit secrets, `.env` files, or local SQLite databases (`*.db`).
- For database schema changes, update `apps/web/prisma/schema.prisma` and document any required `prisma db push` or migration steps in the PR description.
