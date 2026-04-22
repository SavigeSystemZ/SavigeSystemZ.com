# Test Strategy

## Layers

| Layer | Tool | Location | What to test |
|-------|------|----------|-------------|
| **Unit** | Vitest | `apps/web/tests/unit/` | Domain logic, auth helpers, validation, crypto, rate-limit math, webhook processing |
| **Integration** | Vitest | `apps/web/tests/unit/` | API route handlers with mocked DB, state transitions, error responses |
| **E2E** | Playwright | `apps/web/tests/e2e/` | Critical user flows end-to-end through the browser |
| **Accessibility** | axe + Playwright | `apps/web/tests/e2e/a11y.spec.ts` | axe scans on key public routes |
| **Security** | Playwright + Vitest | `apps/web/tests/e2e/` | Negative tests: admin routes without auth, private file access, header spoofing |

## Commands

```bash
pnpm --filter web test          # Vitest unit + integration
pnpm --filter web test:e2e      # Playwright E2E (needs DATABASE_URL + owner secrets)
pnpm check:all                  # Full quality gate: lint + typecheck + test + build
```

## What must be tested

- **Every admin API route**: auth gate returns 401/403 without valid session
- **Stripe webhook**: signature verification rejects invalid signatures; valid payloads process idempotently
- **Signed downloads**: invalid/expired tokens rejected; valid tokens generate presigned URLs
- **Vault mutations**: rate limiting enforced; encryption/decryption roundtrips
- **Public catalog**: `/api/catalog` returns only `PUBLIC` status applications
- **Commerce flow**: checkout creation, webhook processing, entitlement checks

## Coverage gaps (to address)

- [ ] Creator moderation -> promote -> launch compose -> publish (E2E)
- [ ] Archive publish flow (E2E)
- [ ] Live Stripe staging smoke test
- [ ] Multi-step launch composer with S3 upload (blocked by real bucket wiring)

## When to add tests

- New API route → unit test for auth gate + happy path + error cases
- New admin mutation → unit test for audit log emission
- Bug fix → regression test proving the fix
- Security-sensitive change → negative test proving the gate holds
