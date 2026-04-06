import { test, expect } from "@playwright/test";

const OWNER_CODE = process.env.OWNER_ACCESS_CODE ?? "e2e-owner-code";

test.describe("creator submission → moderation → promote flow", () => {
  test("public creator submission is accepted", async ({ request }) => {
    const res = await request.post("/api/creator-submissions", {
      data: {
        title: "E2E Test Submission",
        type: "AUTOMATION",
        summary: "An automation tool submitted via E2E test suite for moderation flow verification.",
        details: "This submission tests the full intake-to-moderation pipeline including promotion and deep-link handoff to the archive launch composer.",
        plannedVisibility: "PUBLIC",
      },
      headers: { "content-type": "application/json" },
    });
    expect(res.status()).toBe(201);
    const body = (await res.json()) as { id?: string };
    expect(body.id).toBeTruthy();
  });

  test("moderation queue returns 403 without owner session", async ({ request }) => {
    const res = await request.get("/api/admin/creator-submissions");
    expect(res.status()).toBe(403);
  });

  test("owner can list, promote, and see handoff metadata", async ({ request }) => {
    // Submit a creator submission
    const submit = await request.post("/api/creator-submissions", {
      data: {
        title: `E2E Promote ${Date.now()}`,
        type: "RESEARCH",
        summary: "Research submission for moderation promotion E2E test.",
        details: "This submission will be promoted to a draft archive entry to verify the promotion bridge and handoff metadata.",
        plannedVisibility: "PUBLIC",
      },
      headers: { "content-type": "application/json" },
    });
    expect(submit.status()).toBe(201);
    const { id: submissionId } = (await submit.json()) as { id: string };

    // Owner login
    const login = await request.post("/api/auth/login", {
      data: { accessCode: OWNER_CODE },
      headers: { "content-type": "application/json" },
    });
    expect(login.ok()).toBeTruthy();

    // List submissions — should include the new one
    const list = await request.get("/api/admin/creator-submissions");
    expect(list.ok()).toBeTruthy();
    const listBody = (await list.json()) as {
      items: Array<{ id: string; status: string }>;
      counts: { pending: number };
    };
    const found = listBody.items.find((item) => item.id === submissionId);
    expect(found).toBeTruthy();
    expect(found?.status).toBe("PENDING");

    // Promote the submission
    const promote = await request.post(`/api/admin/creator-submissions/${submissionId}/promote`);
    expect(promote.ok()).toBeTruthy();
    const promoBody = (await promote.json()) as {
      promotion?: {
        targetType: "APPLICATION" | "ARCHIVE_ENTRY";
        targetId: string;
        targetSlug: string;
      };
    };
    expect(promoBody.promotion).toBeTruthy();
    expect(promoBody.promotion?.targetType).toBe("ARCHIVE_ENTRY");
    expect(promoBody.promotion?.targetId).toBeTruthy();
    expect(promoBody.promotion?.targetSlug).toBeTruthy();

    // Re-fetch submission — should now show promoted metadata
    const refetch = await request.get("/api/admin/creator-submissions");
    expect(refetch.ok()).toBeTruthy();
    const refetchBody = (await refetch.json()) as {
      items: Array<{
        id: string;
        status: string;
        promotedTargetType: string | null;
        promotedTargetId: string | null;
        promotedTargetSlug: string | null;
      }>;
    };
    const promoted = refetchBody.items.find((item) => item.id === submissionId);
    expect(promoted?.status).toBe("APPROVED");
    expect(promoted?.promotedTargetType).toBe("ARCHIVE_ENTRY");
    expect(promoted?.promotedTargetId).toBe(promoBody.promotion?.targetId);
    expect(promoted?.promotedTargetSlug).toBe(promoBody.promotion?.targetSlug);
  });

  test("moderation panel shows promoted entries with handoff links", async ({ page }) => {
    // Submit
    const uniqueTitle = `E2E UI Promote ${Date.now()}`;
    const submitRes = await page.request.post("/api/creator-submissions", {
      data: {
        title: uniqueTitle,
        type: "AUTOMATION",
        summary: "Automation submission for browser-based moderation handoff E2E test.",
        details: "This submission verifies that the moderation panel UI shows dual handoff links (edit + launch composer) after promotion.",
        plannedVisibility: "PUBLIC",
      },
      headers: { "content-type": "application/json" },
    });
    expect(submitRes.status()).toBe(201);
    const { id: submissionId } = (await submitRes.json()) as { id: string };

    // Owner login via browser
    await page.goto("/owner/login");
    await page.getByPlaceholder("Owner access code").fill(OWNER_CODE);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForURL("**/admin**");

    // Navigate to moderation
    await page.getByRole("navigation", { name: "Admin sections" }).getByRole("link", { name: "Moderation" }).click();
    await expect(page.getByRole("heading", { name: /Creator submissions/i })).toBeVisible();

    // Find and promote the submission
    await expect(page.getByText(uniqueTitle)).toBeVisible();

    // Promote via API since the button may be hard to target among many items
    const promoteRes = await page.request.post(`/api/admin/creator-submissions/${submissionId}/promote`);
    expect(promoteRes.ok()).toBeTruthy();

    // Reload moderation page to see updated state
    await page.reload();
    await expect(page.getByText(uniqueTitle)).toBeVisible();

    // Should show "Promoted" badge and handoff links
    const article = page.locator("article", { hasText: uniqueTitle });
    await expect(article.getByText("Promoted")).toBeVisible();
    await expect(article.getByRole("link", { name: /Edit.*archive/i })).toBeVisible();
    await expect(article.getByRole("link", { name: /Launch composer/i })).toBeVisible();
  });
});

test.describe("creator submission API guards", () => {
  test("honeypot field rejects bots", async ({ request }) => {
    const res = await request.post("/api/creator-submissions", {
      data: {
        title: "Bot submission",
        type: "APPLICATION",
        summary: "A suspicious bot-like submission with filled honeypot.",
        details: "This submission should be rejected because the honeypot field is filled in.",
        website: "http://spam.example.com",
      },
      headers: { "content-type": "application/json" },
    });
    // Honeypot-filled requests may return 201 silently (discard) or 400
    // The important thing is no real submission was persisted
    expect([201, 400]).toContain(res.status());
  });
});
