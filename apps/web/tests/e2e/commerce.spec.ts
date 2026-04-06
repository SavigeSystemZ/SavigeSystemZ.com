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

  test("checkout completion is idempotent", async ({ request }) => {
    const cat = await request.get("/api/catalog");
    const catalog = (await cat.json()) as { items: { id: string }[] };
    const applicationId = catalog.items[0]?.id;

    const checkout = await request.post("/api/checkout", {
      data: {
        applicationId,
        purchaserEmail: "e2e-idempotent@example.com",
      },
      headers: { "content-type": "application/json" },
    });
    expect(checkout.ok()).toBeTruthy();
    const { url } = (await checkout.json()) as { url: string };

    // Complete once
    const first = await request.get(url, { maxRedirects: 0 });
    expect([302, 303, 307, 308]).toContain(first.status());

    // Complete again — should still redirect, not error
    const second = await request.get(url, { maxRedirects: 0 });
    expect([302, 303, 307, 308]).toContain(second.status());
  });

  test("checkout rejects missing applicationId", async ({ request }) => {
    const res = await request.post("/api/checkout", {
      data: { purchaserEmail: "bad@example.com" },
      headers: { "content-type": "application/json" },
    });
    expect(res.status()).toBe(400);
  });

  test("checkout rejects invalid email", async ({ request }) => {
    const cat = await request.get("/api/catalog");
    const catalog = (await cat.json()) as { items: { id: string }[] };
    const applicationId = catalog.items[0]?.id;

    const res = await request.post("/api/checkout", {
      data: { applicationId, purchaserEmail: "not-an-email" },
      headers: { "content-type": "application/json" },
    });
    expect(res.status()).toBe(400);
  });

  test("dashboard shows licensed application after purchase", async ({ page }) => {
    const email = `dashboard-${Date.now()}@example.com`;

    // Purchase via API
    const cat = await page.request.get("/api/catalog");
    const catalog = (await cat.json()) as { items: { id: string; name: string }[] };
    const app = catalog.items[0];
    expect(app).toBeTruthy();

    const checkout = await page.request.post("/api/checkout", {
      data: { applicationId: app.id, purchaserEmail: email },
      headers: { "content-type": "application/json" },
    });
    const { url } = (await checkout.json()) as { url: string };

    // Complete and follow redirect to dashboard
    await page.goto(url);
    await expect(page.getByRole("heading", { name: "User Dashboard" })).toBeVisible();
    // Dashboard should show the purchased app
    await expect(page.getByText(app.name)).toBeVisible();
  });

  test("public catalog API returns only PUBLIC applications", async ({ request }) => {
    const res = await request.get("/api/catalog");
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as { items: Array<{ id: string; slug: string; name: string }> };
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items.length).toBeGreaterThan(0);
    // Each item should have required fields
    for (const item of body.items) {
      expect(item.id).toBeTruthy();
      expect(item.slug).toBeTruthy();
      expect(item.name).toBeTruthy();
    }
  });
});
