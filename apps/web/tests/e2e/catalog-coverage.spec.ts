import { test, expect } from "@playwright/test";

type CatalogItem = {
  slug: string;
  name: string;
};

const SAMPLE_SLUGS = ["immortality", "ledgerloop", "vetraxis", "etherweave", "savigesystemz-com"] as const;

test.describe("catalog coverage — all public applications", () => {
  test("every catalog slug returns HTTP 200 with commerce headings on sample set", async ({ page, request }) => {
    const res = await request.get("/api/catalog");
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as { items: CatalogItem[] };
    const items = body.items ?? [];
    expect(items.length).toBeGreaterThanOrEqual(50);

    for (const item of items) {
      const response = await request.get(`/applications/${item.slug}`);
      expect(response.status(), `${item.slug} should return 200`).toBe(200);
      const html = await response.text();
      expect(html).toContain("Download");
      expect(html).toContain("Purchase");
      expect(html).toContain("Donate");
    }

    for (const slug of SAMPLE_SLUGS) {
      const item = items.find((entry) => entry.slug === slug);
      expect(item, `sample slug ${slug} missing from catalog`).toBeTruthy();
    }

    for (const slug of SAMPLE_SLUGS) {
      const item = items.find((entry) => entry.slug === slug)!;
      await page.goto(`/applications/${slug}`);
      await expect(page.getByRole("heading", { name: item.name, exact: true })).toBeVisible();
      await expect(page.locator("img").first()).toBeVisible();
    }
  });
});
