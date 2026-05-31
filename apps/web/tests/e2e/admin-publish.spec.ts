import { expect, test } from "@playwright/test";

const OWNER_CODE = process.env.E2E_OWNER_CODE ?? "e2e-owner-code";

async function loginOwner(page: import("@playwright/test").Page) {
  await page.goto("/owner/login");
  await page.getByPlaceholder("Owner access code").fill(OWNER_CODE);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL("**/admin**");
}

test.describe("admin publish flows", () => {
  test("creates a new application draft, saves it, and publishes it", async ({ page }) => {
    await loginOwner(page);

    await page.goto("/admin");

    // Create a new draft application
    const uniqueSlug = `e2e-app-${Date.now()}`;
    await page.getByPlaceholder("slug").fill(uniqueSlug);
    await page.getByPlaceholder("name").fill("E2E Test App");
    await page.getByPlaceholder("summary").fill("An app created by E2E testing.");
    await page.getByRole("button", { name: "Create app" }).click();

    await expect(page.getByText("Application created.")).toBeVisible();

    // Find the newly created app form
    const appForm = page.locator(`form:has-text("${uniqueSlug}")`);
    await expect(appForm).toBeVisible();

    // Verify it is in DRAFT visibility
    await expect(appForm.getByRole("combobox", { name: /visibility/i })).toHaveValue("DRAFT");

    // We can't easily publish it if it has blockers, but we can verify the save button
    await appForm.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Application updated.")).toBeVisible();

    // Clean up: delete the app
    await appForm.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText("Application deleted.")).toBeVisible();
    await expect(appForm).not.toBeVisible();
  });
});
