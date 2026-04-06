@AGENTS.md

# Quick reference for AI agents in apps/web

## New API route checklist
1. Create `app/api/.../route.ts` with proper HTTP method exports
2. Validate body with Zod via `lib/validation.ts` — return `400` with `issues`
3. Auth: `getAuthContext()` for user context, `requireOwner()` for admin-only
4. Audit: call `writeAuditLog()` for state-changing mutations
5. Rate limit abuse-prone endpoints via `lib/rate-limit.ts`

## New page checklist
1. Public pages go in `app/(public)/`, admin pages in `app/(admin)/admin/`
2. Add `export const dynamic = "force-dynamic"` if using Prisma queries
3. Use `lib/catalog-resolver.ts` for public catalog data
4. Follow existing Tailwind patterns — check sibling pages for design system consistency

## Common mistakes to avoid
- Creating `middleware.ts` — use `proxy.ts` instead (Next.js 16)
- Using `node:crypto` — use `lib/hmac-web.ts` (Web Crypto for Edge)
- Trusting `x-user-*` headers — always use `getAuthContext()`
- Using `db push` for shared schema changes — use `prisma migrate`
- Importing Prisma client directly — use `@/lib/db`
- Hardcoding port 3000 — `pnpm dev:web` auto-selects a port
