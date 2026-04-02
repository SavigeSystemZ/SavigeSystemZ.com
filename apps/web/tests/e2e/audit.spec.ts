import { test, expect } from "@playwright/test";

test.describe("admin audit viewer", () => {
  test("vault placeholder appears when Vault preset is selected", async ({ page }) => {
    await page.goto("/owner/login");
    await page.getByPlaceholder("Owner access code").fill(process.env.OWNER_ACCESS_CODE ?? "e2e-owner-code");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForURL("**/admin**");

    await page.goto("/admin/vault");
    await page.getByLabel(/internal note/i).fill("e2e audit trail for vault placeholder");
    await page.getByRole("button", { name: /register placeholder/i }).click();
    await expect(page.getByText(/Recorded/)).toBeVisible();

    await page.goto("/admin/audit");
    await page.getByRole("button", { name: "Vault placeholder" }).click();
    await expect(page.getByText("vault.placeholder.submit").first()).toBeVisible();
  });
});
