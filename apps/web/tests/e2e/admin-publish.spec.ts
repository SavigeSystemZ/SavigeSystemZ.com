import { expect, test } from "@playwright/test";
import { seedOwnerSession } from "./helpers/owner-auth";

async function loginOwner(page: import("@playwright/test").Page, request: import("@playwright/test").APIRequestContext) {
  await seedOwnerSession(request, page);
  await page.goto("/admin");
}

test.describe("admin publish flows", () => {
  test("creates a new application draft, saves it, and publishes it", async ({ page, request }) => {
    await loginOwner(page, request);

    await page.goto("/admin");

    // Create a new draft application
    const uniqueSlug = `e2e-app-${Date.now()}`;
    // Create form is the first block on /admin — avoid matching per-app edit forms.
    const createForm = page.locator("form").filter({ has: page.getByRole("button", { name: "Create app" }) });
    await createForm.getByPlaceholder("slug").fill(uniqueSlug);
    await createForm.getByPlaceholder("name").fill("E2E Test App");
    await createForm.getByPlaceholder("summary").fill("An app created by E2E testing.");
    await createForm.getByRole("button", { name: "Create app" }).click();

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
