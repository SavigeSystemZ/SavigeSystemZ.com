import { test, expect } from "@playwright/test";

test.describe("Stripe webhook guard", () => {
  test("POST /api/webhooks/stripe returns 501 when Stripe is not configured", async ({ request }) => {
    const res = await request.post("/api/webhooks/stripe", {
      data: "{}",
      headers: {
        "content-type": "application/json",
        "stripe-signature": "t=0,v1=deadbeef",
      },
    });
    expect(res.status()).toBe(501);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBe("webhook_not_configured");
  });
});
