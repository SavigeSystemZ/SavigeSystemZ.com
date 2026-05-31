import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const OWNER_CODE = process.env.E2E_OWNER_CODE ?? "e2e-owner-code";
const prisma = new PrismaClient();

async function loginOwner(page: import("@playwright/test").Page) {
  await page.goto("/owner/login");
  await page.getByPlaceholder("Owner access code").fill(OWNER_CODE);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL("**/admin**");
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

  test("keeps focus when switching timeframe", async ({ page }) => {
    await loginOwner(page);

    await page.goto("/admin?window=24h&focus=requests");
    await expect(page.getByRole("heading", { name: /project request queue details/i })).toBeVisible();

    await page.getByRole("link", { name: "7d" }).click();
    await expect(page).toHaveURL(/\/admin\?window=7d&focus=requests/);
    await expect(page.getByRole("heading", { name: /project request queue details/i })).toBeVisible();
  });

  test("renders audit focus drilldown and trend lane", async ({ page }) => {
    await loginOwner(page);

    await page.goto("/admin?window=7d&focus=audit");
    await expect(page.getByRole("heading", { name: /audit anomaly details \(7d\)/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /review bursts/i })).toBeVisible();
  });

  test("supports refresh controls and shows freshness telemetry", async ({ page }) => {
    await loginOwner(page);

    await page.goto("/admin?window=24h&focus=repos&refresh=off");
    await expect(page.getByText(/last updated/i)).toBeVisible();

    await page.getByRole("link", { name: "30s" }).click();
    await expect(page).toHaveURL(/\/admin\?window=24h&focus=repos&refresh=30s/);
    await expect(page.getByRole("heading", { name: /repository sync errors/i })).toBeVisible();
  });

  test("dismisses spike notices", async ({ page }) => {
    await loginOwner(page);

    await page.goto("/admin");
    await expect(page.getByText("E2E Test Spike Notice")).toBeVisible();
    
    const dismissButton = page.getByRole("button", { name: /dismiss/i }).first();
    await dismissButton.click();
    
    // Wait for it to disappear
    await expect(page.getByText("E2E Test Spike Notice")).not.toBeVisible();
  });
});
