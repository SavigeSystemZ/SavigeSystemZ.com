import { expect, type APIRequestContext, type Page } from "@playwright/test";

export const OWNER_CODE =
  process.env.OWNER_ACCESS_CODE ?? process.env.E2E_OWNER_CODE ?? "e2e-owner-code";

/** Seed an owner session cookie — avoids flaky form login under parallel E2E load. */
export async function seedOwnerSession(request: APIRequestContext, page: Page): Promise<void> {
  const login = await request.post("/api/auth/login", {
    data: { accessCode: OWNER_CODE },
    headers: { "content-type": "application/json" },
  });
  expect(login.ok()).toBeTruthy();
  const cookies = await request.storageState();
  await page.context().addCookies(cookies.cookies);
}

/** Form login — use only when the login UI flow itself is under test. */
export async function loginOwnerViaForm(page: Page): Promise<void> {
  await page.goto("/owner/login");
  await page.getByPlaceholder("Owner access code").fill(OWNER_CODE);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL("**/admin**", { timeout: 30_000, waitUntil: "domcontentloaded" });
}
