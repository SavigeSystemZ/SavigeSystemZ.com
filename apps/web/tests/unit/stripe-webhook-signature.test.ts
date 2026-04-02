import { describe, it, expect } from "vitest";
import Stripe from "stripe";

/**
 * Regression: Stripe's test header helper must round-trip with constructEvent.
 * Used in manual / CI webhook tests with a real signing secret.
 */
describe("Stripe webhook signature (SDK contract)", () => {
  it("constructEvent accepts generateTestHeaderString payload", () => {
    const stripe = new Stripe("sk_test_placeholder");
    const secret = "whsec_test_signing_secret_32chars_min";
    const payload = JSON.stringify({
      id: "evt_test_webhook",
      object: "event",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          object: "checkout.session",
        },
      },
    });
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret });
    const event = stripe.webhooks.constructEvent(payload, header, secret);
    expect(event.type).toBe("checkout.session.completed");
    const session = event.data.object as { id?: string };
    expect(session.id).toBe("cs_test_123");
  });
});
