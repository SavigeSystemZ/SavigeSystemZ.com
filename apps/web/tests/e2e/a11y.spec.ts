import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";

const OWNER_CODE = process.env.OWNER_ACCESS_CODE ?? "e2e-owner-code";

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

test.describe("accessibility — public routes (axe)", () => {
  test("home page", async ({ page }) => {
    await page.goto("/");
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag21a"]).analyze();
    expect(seriousViolations(violations)).toEqual([]);
  });

  test("applications catalog", async ({ page }) => {
    await page.goto("/applications");
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag21a"]).analyze();
    expect(seriousViolations(violations)).toEqual([]);
  });

  test("application detail (seeded slug)", async ({ page }) => {
    await page.goto("/applications/wireless-ops-suite");
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag21a"]).analyze();
    expect(seriousViolations(violations)).toEqual([]);
  });

  test("archive index", async ({ page }) => {
    await page.goto("/archive");
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag21a"]).analyze();
    expect(seriousViolations(violations)).toEqual([]);
  });

  test("bio page", async ({ page }) => {
    await page.goto("/bio");
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag21a"]).analyze();
    expect(seriousViolations(violations)).toEqual([]);
  });

  test("pricing page", async ({ page }) => {
    await page.goto("/pricing");
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag21a"]).analyze();
    expect(seriousViolations(violations)).toEqual([]);
  });

  test("reviews page", async ({ page }) => {
    await page.goto("/reviews");
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag21a"]).analyze();
    expect(seriousViolations(violations)).toEqual([]);
  });

  test("services page", async ({ page }) => {
    await page.goto("/services");
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag21a"]).analyze();
    expect(seriousViolations(violations)).toEqual([]);
  });

  test("downloads page", async ({ page }) => {
    await page.goto("/downloads");
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag21a"]).analyze();
    expect(seriousViolations(violations)).toEqual([]);
  });

  test("creator intake page", async ({ page }) => {
    await page.goto("/creator");
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag21a"]).analyze();
    expect(seriousViolations(violations)).toEqual([]);
  });

  test("owner login page", async ({ page }) => {
    await page.goto("/owner/login");
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag21a"]).analyze();
    expect(seriousViolations(violations)).toEqual([]);
  });

  test("reduced-motion mode still passes on home + applications", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();

    await page.goto("/");
    const home = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag21a"]).analyze();
    expect(seriousViolations(home.violations)).toEqual([]);

    await page.goto("/applications");
    const apps = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag21a"]).analyze();
    expect(seriousViolations(apps.violations)).toEqual([]);

    await context.close();
  });
});

test.describe("accessibility — admin routes (axe)", () => {
  test("admin overview after owner login", async ({ page }) => {
    await page.goto("/owner/login");
    await page.getByPlaceholder("Owner access code").fill(OWNER_CODE);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForURL("**/admin**");
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag21a"]).analyze();
    expect(seriousViolations(violations)).toEqual([]);
  });

  test("admin archive manager", async ({ page }) => {
    await page.goto("/owner/login");
    await page.getByPlaceholder("Owner access code").fill(OWNER_CODE);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForURL("**/admin**");
    await page.goto("/admin/archive");
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag21a"]).analyze();
    expect(seriousViolations(violations)).toEqual([]);
  });
});
