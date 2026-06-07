import { expect, test } from "@playwright/test";
import { seedOwnerSession } from "./helpers/owner-auth";

test.describe("admin command palette", () => {
  test("owner can open palette, filter commands, and navigate", async ({ page, request }) => {
    await seedOwnerSession(request, page);
    await page.goto("/admin");

    await page.getByRole("button", { name: /open command palette/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByLabel("Command palette search").fill("code");
    await expect(page.getByText("Open code module")).toBeVisible();
    await page.getByText("Open code module").click();
    await page.waitForURL("**/admin/code");
  });
});
