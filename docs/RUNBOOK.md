# SavigeSystemZ Runbook

## Local development
1. Install Node.js 22+ and pnpm.
2. Run `pnpm install`.
3. Run `pnpm dev`.

## Validation gate
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

## Incident handling baseline
- Identify impacted surface and recent deploy
- Toggle feature flags for risky subsystems
- Roll back release if user-impacting regressions exceed threshold
- Preserve logs and evidence for postmortem

## Release checklist
- All CI gates green
- Security checks reviewed
- Smoke tests pass for home/catalog/detail/download/auth/admin
