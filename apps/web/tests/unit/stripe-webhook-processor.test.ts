import { describe, it, expect, vi, beforeEach } from "vitest";
import type Stripe from "stripe";
import { processStripeWebhookEvent } from "@/lib/stripe-webhook-processor";

vi.mock("@/lib/checkout-complete", () => ({
  completePurchaseFromSessionId: vi.fn(async () => ({ ok: true })),
}));

import { completePurchaseFromSessionId } from "@/lib/checkout-complete";

describe("processStripeWebhookEvent", () => {
  beforeEach(() => {
    vi.mocked(completePurchaseFromSessionId).mockClear();
  });

  it("calls completePurchaseFromSessionId for checkout.session.completed", async () => {
    const event = {
      type: "checkout.session.completed",
      data: { object: { id: "cs_test_abc" } },
    } as unknown as Stripe.Event;
    await processStripeWebhookEvent(event);
    expect(completePurchaseFromSessionId).toHaveBeenCalledWith("cs_test_abc");
  });

  it("does not call completePurchaseFromSessionId for other event types", async () => {
    const event = {
      type: "charge.succeeded",
      data: { object: { id: "ch_1" } },
    } as unknown as Stripe.Event;
    await processStripeWebhookEvent(event);
    expect(completePurchaseFromSessionId).not.toHaveBeenCalled();
  });

  it("skips when checkout session id is missing", async () => {
    const event = {
      type: "checkout.session.completed",
      data: { object: {} },
    } as unknown as Stripe.Event;
    await processStripeWebhookEvent(event);
    expect(completePurchaseFromSessionId).not.toHaveBeenCalled();
  });
});
