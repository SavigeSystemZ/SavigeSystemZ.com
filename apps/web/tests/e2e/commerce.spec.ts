import { test, expect } from "@playwright/test";

test.describe("mock commerce flow", () => {
  test("browser purchase from application detail completes to dashboard", async ({ page }) => {
    await page.goto("/applications/wireless-ops-suite");
    await page.getByLabel(/email for receipt/i).fill("browser-buyer@example.com");
    await page.getByRole("button", { name: "Purchase" }).click();
    await page.waitForURL("**/dashboard**");
    await expect(page.getByRole("heading", { name: "User Dashboard" })).toBeVisible();
  });

  test("mock checkout creates purchase and completes to dashboard", async ({ request }) => {
    const cat = await request.get("/api/catalog");
    expect(cat.ok()).toBeTruthy();
    const catalog = (await cat.json()) as { items: { id: string }[] };
    const applicationId = catalog.items[0]?.id;
    expect(applicationId).toBeTruthy();

    const checkout = await request.post("/api/checkout", {
      data: {
        applicationId,
        purchaserEmail: "e2e-buyer@example.com",
      },
      headers: { "content-type": "application/json" },
    });
    expect(checkout.ok()).toBeTruthy();
    const body = (await checkout.json()) as { mode?: string; url?: string };
    expect(body.mode).toBe("mock");
    expect(body.url).toContain("/api/checkout/complete?session_id=");

    const complete = await request.get(body.url!, { maxRedirects: 0 });
    expect([302, 303, 307, 308]).toContain(complete.status());
    const loc = complete.headers()["location"] ?? "";
    expect(loc).toContain("/dashboard");
    expect(loc).toContain("checkout=success");
  });
});
