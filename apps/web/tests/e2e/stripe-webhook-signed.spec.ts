import Stripe from "stripe";
import { test, expect } from "@playwright/test";

test.describe("Stripe signed webhook (optional secrets)", () => {
  test("accepts constructEvent-signed POST when Stripe is configured", async ({ request }) => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
    const sk = process.env.STRIPE_SECRET_KEY?.trim();
    if (!secret || !sk) {
      test.skip();
      return;
    }

    const stripe = new Stripe(sk);
    const payload = JSON.stringify({
      id: "evt_e2e_playwright",
      object: "event",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_mock_e2e_webhook",
          object: "checkout.session",
        },
      },
    });
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret });
    const res = await request.post("/api/webhooks/stripe", {
      data: payload,
      headers: {
        "content-type": "application/json",
        "stripe-signature": header,
      },
    });
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as { received?: boolean };
    expect(body.received).toBe(true);
  });
});
