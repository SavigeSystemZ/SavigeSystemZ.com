import { expect, test } from "@playwright/test";

const OWNER_CODE = process.env.E2E_OWNER_CODE ?? "e2e-owner-code";

test.describe("admin command palette", () => {
  test("owner can open palette, filter commands, and navigate", async ({ page }) => {
    await page.goto("/owner/login");
    await page.getByPlaceholder("Owner access code").fill(OWNER_CODE);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForURL("**/admin**");

    await page.getByRole("button", { name: /open command palette/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByLabel("Command palette search").fill("code");
    await expect(page.getByText("Open code module")).toBeVisible();
    await page.getByText("Open code module").click();
    await page.waitForURL("**/admin/code");
  });
});
