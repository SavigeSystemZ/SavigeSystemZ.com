# Stripe webhook testing

Production flow: Stripe signs each webhook with `Stripe-Signature` using your **`STRIPE_WEBHOOK_SECRET`** (starts with `whsec_`). The app verifies with `stripe.webhooks.constructEvent(...)` then runs `processStripeWebhookEvent` (`lib/stripe-webhook-processor.ts`).

## Local development

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli).
2. Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in `apps/web/.env.local` (or export in the shell).
3. Forward events to your dev server:

```bash
stripe listen --forward-to http://127.0.0.1:3000/api/webhooks/stripe
```

The CLI prints a **webhook signing secret** — use that value as `STRIPE_WEBHOOK_SECRET` for local verification.

4. Trigger a test event:

```bash
stripe trigger checkout.session.completed
```

## Automated tests (unit)

- **`tests/unit/stripe-webhook-processor.test.ts`** — ensures `checkout.session.completed` calls `completePurchaseFromSessionId`.
- **`tests/unit/stripe-webhook-signature.test.ts`** — ensures `generateTestHeaderString` + `constructEvent` round-trip (SDK contract).

## CI without secrets

The Playwright spec **`tests/e2e/stripe-webhook.spec.ts`** asserts **501** when Stripe is not configured; that remains the default CI path.

## Optional CI with secrets

Repository workflow **`stripe-webhook-smoke.yml`** (`workflow_dispatch`) runs **`tests/e2e/stripe-webhook-signed.spec.ts`** when `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are configured as **GitHub Actions secrets**. The job is skipped if secrets are missing.

Keep keys scoped to a Stripe **test mode** account.
