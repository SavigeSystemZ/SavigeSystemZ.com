import { test, expect } from "@playwright/test";

test.describe("flagship catalog — GitHub mirror + applications", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("applications catalog lists seeded flagship systems", async ({ page }) => {
    await page.goto("/applications");
    await expect(page.getByRole("heading", { name: /every savigesystemz github repo/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Immortality", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "LedgerLoop" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "SavigeSystemZ.com" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Games", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Books & literature", exact: true })).toBeVisible();
  });

  test("application detail surfaces source code card linked to repo page", async ({ page }) => {
    await page.goto("/applications/immortality");
    await expect(page.getByRole("heading", { name: "Immortality", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Download", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Purchase", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Donate", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /donate to this project/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /support on github sponsors/i })).toBeVisible();
    const repoLink = page.getByRole("link", { name: /view repository details/i });
    await repoLink.scrollIntoViewIfNeeded();
    await expect(repoLink).toBeVisible();
    await repoLink.click();
    await expect(page).toHaveURL(/\/repos\/savigesystemz-immortality/);
    await expect(page.getByRole("heading", { name: "README" })).toBeVisible();
  });

  test("downloads page shows versioned release lanes", async ({ page }) => {
    await page.goto("/downloads");
    const immortalityCard = page.locator("article").filter({ has: page.getByRole("heading", { name: "Immortality" }) });
    await expect(immortalityCard.getByText("0.1.0", { exact: true })).toBeVisible();
  });

  test("home page highlights featured catalog entries", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/flagship catalog/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Immortality", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /browse source repos/i })).toBeVisible();
  });
});
