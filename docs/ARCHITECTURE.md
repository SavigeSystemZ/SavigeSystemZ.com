# SavigeSystemZ Architecture

## Topology
- Monorepo with Turborepo and pnpm workspaces
- Primary runtime in `apps/web` (Next.js App Router)
- Shared packages for domain, security, UI, and AI contracts
- Worker service for asynchronous pipelines

## Delivery model
- Modular monolith first
- Extract services only when operational pressure is proven

## Major route zones
- Public marketing/catalog/download surfaces
- Authenticated user dashboard surfaces
- Owner/admin protected route group
- API route handlers with explicit authz boundaries

## Persistence baseline
- Prisma ORM with initial schema under `apps/web/prisma/schema.prisma`
- SQLite local development baseline (`apps/web/dev.db`) with production path planned for managed Postgres
- Admin CRUD surfaces use typed validation and audit log hooks

## Security model anchors
- Least privilege and deny-by-default for admin/private routes
- Signed short-lived file access for private assets
- Audit logging for sensitive actions
- Zero-trust upload handling and moderation gates

## Observability
- OpenTelemetry instrumentation hooks
- Error/event capture with Sentry

## Scalability posture
- SSR/streaming where beneficial
- Caching strategy per route and data freshness
- CDN asset delivery for media and binaries
