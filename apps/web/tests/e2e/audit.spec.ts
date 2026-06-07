import { test, expect } from "@playwright/test";
import { seedOwnerSession } from "./helpers/owner-auth";

test.describe("admin audit viewer", () => {
  test("vault placeholder appears when Vault preset is selected", async ({ page, request }) => {
    await seedOwnerSession(request, page);
    await page.goto("/admin/vault");
    await page.getByLabel(/internal note/i).fill("e2e audit trail for vault placeholder");
    await page.getByRole("button", { name: /register placeholder/i }).click();
    await expect(page.getByText(/Recorded/)).toBeVisible();

    await page.goto("/admin/audit");
    await page.getByRole("button", { name: "Vault placeholder" }).click();
    await expect(page.getByText("vault.placeholder.submit").first()).toBeVisible();
  });
});
