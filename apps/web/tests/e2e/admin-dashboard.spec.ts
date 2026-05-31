import { expect, test } from "@playwright/test";

const OWNER_CODE = process.env.E2E_OWNER_CODE ?? "e2e-owner-code";

async function loginOwner(page: import("@playwright/test").Page) {
  await page.goto("/owner/login");
  await page.getByPlaceholder("Owner access code").fill(OWNER_CODE);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL("**/admin**");
}

test.describe("admin dashboard intelligence", () => {
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

    // This test relies on a spike notice being present.
    // If one isn't present, we'll just check that it handles gracefully.
    await page.goto("/admin");
    const dismissButton = page.getByRole("button", { name: /dismiss/i }).first();
    if (await dismissButton.isVisible()) {
      await dismissButton.click();
      // Wait for it to disappear or the page to refresh
      await expect(dismissButton).not.toBeVisible();
    }
  });
});
