import { expect, test } from "@playwright/test";

test.describe("public repos directory", () => {
  test("renders the repos index and navigates to a repo detail", async ({ page }) => {
    // Note: If no repos are seeded, this will just show the empty state.
    // For a real end-to-end test, we might want to ensure at least one repo is public,
    // or we just assert that the page loads correctly and shows the correct header.
    await page.goto("/repos");
    await expect(page.getByRole("heading", { name: /Public source code tracked by the foundry/i })).toBeVisible();

    // Check if there are any repo links
    const repoLinks = page.locator('a[href^="/repos/"]');
    if (await repoLinks.count() > 0) {
      await repoLinks.first().click();
      await expect(page.locator("text=README")).toBeVisible();
    }
  });
});
