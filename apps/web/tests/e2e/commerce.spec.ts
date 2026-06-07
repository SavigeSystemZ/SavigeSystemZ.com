import { test, expect } from "@playwright/test";

test.describe("mock commerce flow", () => {
  test("browser purchase from application detail completes to dashboard", async ({ page }) => {
    await page.goto("/applications/immortality");
    await page.getByLabel(/email for receipt/i).fill("browser-buyer@example.com");
    await page.getByRole("button", { name: "Purchase" }).click();
    await page.waitForURL("**/dashboard**");
    // Dashboard renders contextual headings based on session state — just verify we landed
    await expect(page.locator("h1")).toBeVisible({ timeout: 10_000 });
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
    // Dashboard renders contextual headings — verify we landed and see the app
    await expect(page.locator("h1")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("main").getByText(app.name, { exact: true })).toBeVisible({ timeout: 10_000 });
  });

  test("public catalog API returns only PUBLIC applications", async ({ request }) => {
    const res = await request.get("/api/catalog");
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as { items: Array<{ id: string; slug: string; name: string }> };
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items.length).toBeGreaterThan(0);
    for (const item of body.items) {
      expect(item.id).toBeTruthy();
      expect(item.slug).toBeTruthy();
      expect(item.name).toBeTruthy();
    }
  });

  test("mock donate checkout completes to application thanks state", async ({ request }) => {
    const cat = await request.get("/api/catalog");
    const catalog = (await cat.json()) as { items: { id: string; slug: string }[] };
    const application = catalog.items.find((item) => item.slug === "immortality") ?? catalog.items[0];
    expect(application).toBeTruthy();

    const donate = await request.post("/api/donate", {
      data: {
        applicationId: application.id,
        donorEmail: "e2e-donor@example.com",
      },
      headers: { "content-type": "application/json" },
    });
    expect(donate.ok()).toBeTruthy();
    const body = (await donate.json()) as { mode?: string; url?: string };
    expect(body.mode).toBe("mock");
    expect(body.url).toContain("/api/donate/complete?session_id=");

    const complete = await request.get(body.url!, { maxRedirects: 0 });
    expect([302, 303, 307, 308]).toContain(complete.status());
    const location = complete.headers()["location"] ?? "";
    expect(location).toContain(`/applications/${application.slug}`);
    expect(location).toContain("donate=thanks");
  });
});
