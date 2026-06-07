import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { seedOwnerSession } from "./helpers/owner-auth";

const prisma = new PrismaClient();

async function loginOwner(page: import("@playwright/test").Page, request: import("@playwright/test").APIRequestContext) {
  await seedOwnerSession(request, page);
  await page.goto("/admin");
}

test.describe("admin dashboard intelligence", () => {
  test.beforeAll(async () => {
    // Seed a fake alert to test dismissal
    await prisma.dashboardAlert.upsert({
      where: { alertKey: "spike:test-lane:24h" },
      create: {
        alertKey: "spike:test-lane:24h",
        category: "spike",
        severity: "warn",
        message: "E2E Test Spike Notice",
        metadata: JSON.stringify({ href: "/admin", value: 100 }),
        firstSeenAt: new Date(),
        lastSeenAt: new Date(),
      },
      update: {
        lastSeenAt: new Date(),
        acknowledgedAt: null,
        acknowledgedBy: null,
      },
    });
  });

  test.afterAll(async () => {
    await prisma.dashboardAlert.deleteMany({
      where: { alertKey: "spike:test-lane:24h" },
    });
    await prisma.$disconnect();
  });

  test("keeps focus when switching timeframe", async ({ page, request }) => {
    await loginOwner(page, request);

    await page.goto("/admin?window=24h&focus=requests");
    await expect(page.getByRole("heading", { name: /project request queue details/i })).toBeVisible();

    await page.getByRole("link", { name: "7d" }).click();
    await expect(page).toHaveURL(/\/admin\?window=7d&focus=requests/);
    await expect(page.getByRole("heading", { name: /project request queue details/i })).toBeVisible();
  });

  test("renders audit focus drilldown and trend lane", async ({ page, request }) => {
    await loginOwner(page, request);

    await page.goto("/admin?window=7d&focus=audit");
    await expect(page.getByRole("heading", { name: /audit anomaly details \(7d\)/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /review bursts/i })).toBeVisible();
  });

  test("supports refresh controls and shows freshness telemetry", async ({ page, request }) => {
    await loginOwner(page, request);

    await page.goto("/admin?window=24h&focus=repos&refresh=off");
    await expect(page.getByText(/last updated/i)).toBeVisible();

    await page.getByRole("link", { name: "30s" }).click();
    await expect(page).toHaveURL(/\/admin\?window=24h&focus=repos&refresh=30s/);
    await expect(page.getByRole("heading", { name: /repository sync errors/i })).toBeVisible();
  });

  test("dismisses spike notices", async ({ page, request }) => {
    await loginOwner(page, request);

    await page.goto("/admin");
    const spikeNotice = page.locator('[role="status"]').filter({ hasText: "E2E Test Spike Notice" });
    await expect(spikeNotice).toBeVisible();

    const ackPromise = page.waitForResponse(
      (response) => response.url().includes("/api/admin/dashboard/acknowledge") && response.ok(),
    );
    await spikeNotice.getByRole("button", { name: "Dismiss" }).click();
    await ackPromise;

    await expect(spikeNotice).not.toBeVisible();
  });
});
