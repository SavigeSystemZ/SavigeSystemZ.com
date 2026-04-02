import { test, expect } from "@playwright/test";

test.describe("owner and public shell", () => {
  test("project request form submits on services page", async ({ page }) => {
    await page.goto("/services");
    await page.getByPlaceholder("e.g. Internal tooling for release automation").fill("E2E test project");
    await page
      .getByPlaceholder("Objectives, constraints, timeline, budget range, and success criteria.")
      .fill(
        "End-to-end test submission with enough characters to satisfy validation and confirm the API responds.",
      );
    await page.getByRole("button", { name: "Submit request" }).click();
    await expect(page.getByText(/Request received/)).toBeVisible();
  });

  test("submitted project request appears in owner admin", async ({ page }) => {
    const uniqueTitle = `E2E admin ${Date.now()}`;
    await page.goto("/services");
    await page.getByPlaceholder("e.g. Internal tooling for release automation").fill(uniqueTitle);
    await page
      .getByPlaceholder("Objectives, constraints, timeline, budget range, and success criteria.")
      .fill(
        "Verification flow for persisted project requests in the admin console with enough characters.",
      );
    await page.getByRole("button", { name: "Submit request" }).click();
    await expect(page.getByText(/Request received/)).toBeVisible();

    await page.goto("/owner/login");
    await page.getByPlaceholder("Owner access code").fill("e2e-owner-code");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForURL("**/admin**");
    await page.getByRole("navigation", { name: "Admin sections" }).getByRole("link", { name: "Requests" }).click();
    await expect(page.getByRole("heading", { name: "Inbound project requests" })).toBeVisible();
    await expect(page.getByText(uniqueTitle)).toBeVisible();
  });

  test("health endpoint returns ok", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as { ok?: boolean };
    expect(body.ok).toBe(true);
  });

  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "SavigeSystemZ" })).toBeVisible();
  });

  test("owner login redirects to admin", async ({ page }) => {
    await page.goto("/owner/login");
    await page.getByPlaceholder("Owner access code").fill("e2e-owner-code");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForURL("**/admin**");
    await expect(page.getByRole("heading", { name: "Owner Admin Console" })).toBeVisible();
  });

  test("admin shell navigates to audit log", async ({ page }) => {
    await page.goto("/owner/login");
    await page.getByPlaceholder("Owner access code").fill("e2e-owner-code");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForURL("**/admin**");
    await page.getByRole("navigation", { name: "Admin sections" }).getByRole("link", { name: "Audit" }).click();
    await expect(page.getByRole("heading", { name: "Audit Log" })).toBeVisible();
  });

  test("owner can sign out from admin shell", async ({ page }) => {
    await page.goto("/owner/login");
    await page.getByPlaceholder("Owner access code").fill("e2e-owner-code");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForURL("**/admin**");
    await page.getByRole("button", { name: "Sign out" }).click();
    await page.waitForURL("**/owner/login**");
    await expect(page.getByRole("heading", { name: "Owner Login" })).toBeVisible();
  });
});
