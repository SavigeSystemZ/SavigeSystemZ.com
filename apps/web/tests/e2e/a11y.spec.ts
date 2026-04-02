import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";

/**
 * Automated WCAG checks (axe-core). Fails on serious/critical issues excluding
 * `color-contrast` — dark-theme marketing UIs often need intentional contrast tradeoffs;
 * track those in visual/brand review rather than blocking CI.
 */
function seriousViolations(violations: { id: string; impact?: string | null }[]) {
  return violations.filter(
    (v) =>
      v.id !== "color-contrast" &&
      (v.impact === "critical" || v.impact === "serious"),
  );
}

test.describe("accessibility (axe)", () => {
  test("home page", async ({ page }) => {
    await page.goto("/");
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag21a"]).analyze();
    expect(seriousViolations(violations)).toEqual([]);
  });

  test("services (form + main landmark)", async ({ page }) => {
    await page.goto("/services");
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag21a"]).analyze();
    expect(seriousViolations(violations)).toEqual([]);
  });

  test("application detail (seeded slug)", async ({ page }) => {
    await page.goto("/applications/wireless-ops-suite");
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag21a"]).analyze();
    expect(seriousViolations(violations)).toEqual([]);
  });

  test("admin overview after owner login", async ({ page }) => {
    await page.goto("/owner/login");
    await page.getByPlaceholder("Owner access code").fill(process.env.OWNER_ACCESS_CODE ?? "e2e-owner-code");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForURL("**/admin**");
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag21a"]).analyze();
    expect(seriousViolations(violations)).toEqual([]);
  });
});
