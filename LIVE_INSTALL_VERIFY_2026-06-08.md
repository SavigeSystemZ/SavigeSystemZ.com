# SavigeSystemZ.com — Live Install / Desktop-Icon Verify (2026-06-08)

Turbo monorepo; runnable web is `apps/web` (**Next.js 16 + Prisma/Postgres**) — the public **showcase/foundry site** for the whole MyAppZ ecosystem (catalog, releases, archive, owner admin). `.next` prebuilt.

## Bug fixed
- Public pages 200 but logged `prisma:error … Can't reach database server at localhost:5433`. Provisioned Postgres (role `ssz`/`dev` + db `savige`) **via peer auth (no sudo)**, repointed `DATABASE_URL` to `:5432`, ran `prisma migrate deploy` + `prisma generate`, ran the flagship seed script (no errors). Pages now render without DB errors.

## Added
- Unique "SZ" icon → ~/.local/share/icons/savigesystemz.svg (+ repo copy), **savigesystemz.service** (next start :41361, with DATABASE_URL), launcher + `~/Desktop/savigesystemz.desktop` (exec+trusted).

## Verify
- Service active; `/`, `/applications`, `/archive`, `/downloads`, `/pricing`, `/bio` → 200 and render. Home shows "An operator-grade home for products, releases, systems work…" with Command Deck (2 Catalog Systems / 1 Featured Launch / 8 Archive Drops), Public Showcase, Owner Operations, AI Concierge. Screenshots in `screenshots/`.

## Notes
- Catalog is empty of seeded apps (seed needs a GitHub org sync — `code:sync-org`); the site renders its full structure regardless. Admin/owner routes exist behind auth.
