import { test, expect, type APIRequestContext } from "@playwright/test";
import { OWNER_CODE } from "./helpers/owner-auth";

async function ownerLogin(request: APIRequestContext) {
  const login = await request.post("/api/auth/login", {
    data: { accessCode: OWNER_CODE },
    headers: { "content-type": "application/json" },
  });
  expect(login.ok()).toBeTruthy();
  return request;
}

test.describe.configure({ mode: "serial" });

test.describe("full pipeline: submit → moderate → promote → compose → publish", () => {
  const ts = Date.now();
  let submissionId: string;
  let promotedSlug: string;
  let promotedId: string;

  test("creator submits a new entry via public API", async ({ request }) => {
    const res = await request.post("/api/submissions", {
      data: {
        title: `Pipeline E2E ${ts}`,
        type: "AUTOMATION",
        summary: "Full pipeline test: creator intake through public moderation to archive publish.",
        details: "Validates the entire lifecycle from public submission to promoted archive entry to published public artifact.",
        plannedVisibility: "PUBLIC",
        artifactUrl: "https://example.com/pipeline-e2e-artifact",
      },
      headers: { "content-type": "application/json" },
    });
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as { ok?: boolean; id?: string };
    expect(body.ok).toBe(true);
    expect(body.id).toBeTruthy();
    submissionId = body.id!;
  });

  test("owner sees submission in moderation queue and promotes it", async ({ request }) => {
    await ownerLogin(request);

    // List — should include the submission
    const list = await request.get("/api/admin/creator-submissions");
    expect(list.ok()).toBeTruthy();
    const { items } = (await list.json()) as { items: Array<{ id: string; status: string }> };
    const found = items.find((i) => i.id === submissionId);
    expect(found).toBeTruthy();
    expect(found?.status).toBe("PENDING");

    // Promote
    const promote = await request.post(`/api/admin/creator-submissions/${submissionId}/promote`);
    expect(promote.ok()).toBeTruthy();
    const promoBody = (await promote.json()) as {
      promotion?: { targetType: string; targetId: string; targetSlug: string };
    };
    expect(promoBody.promotion?.targetType).toBe("ARCHIVE_ENTRY");
    expect(promoBody.promotion?.targetId).toBeTruthy();
    expect(promoBody.promotion?.targetSlug).toBeTruthy();
    promotedId = promoBody.promotion!.targetId;
    promotedSlug = promoBody.promotion!.targetSlug;
  });

  test("promoted archive entry exists as DRAFT", async ({ request }) => {
    await ownerLogin(request);
    const res = await request.get("/api/admin/archive");
    expect(res.ok()).toBeTruthy();
    const { items } = (await res.json()) as { items: Array<{ id: string; slug: string; visibility: string }> };
    const entry = items.find((i) => i.id === promotedId);
    expect(entry).toBeTruthy();
    expect(entry?.slug).toBe(promotedSlug);
    expect(entry?.visibility).toBe("DRAFT");
  });

  test("owner publishes the promoted archive entry", async ({ request }) => {
    await ownerLogin(request);
    const res = await request.post(`/api/admin/archive/${promotedId}/publish`);
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as { item?: { visibility: string }; launchReadiness?: { ready: boolean } };
    expect(body.item?.visibility).toBe("PUBLIC");
    expect(body.launchReadiness?.ready).toBe(true);
  });

  test("published entry appears on the public archive page", async ({ page }) => {
    await page.goto("/archive");
    await expect(page.getByText(`Pipeline E2E ${ts}`)).toBeVisible({ timeout: 10_000 });
  });

  test("submission shows APPROVED status with promotion metadata", async ({ request }) => {
    await ownerLogin(request);
    const list = await request.get("/api/admin/creator-submissions");
    expect(list.ok()).toBeTruthy();
    const { items } = (await list.json()) as {
      items: Array<{
        id: string;
        status: string;
        promotedTargetType: string | null;
        promotedTargetId: string | null;
      }>;
    };
    const sub = items.find((i) => i.id === submissionId);
    expect(sub?.status).toBe("APPROVED");
    expect(sub?.promotedTargetType).toBe("ARCHIVE_ENTRY");
    expect(sub?.promotedTargetId).toBe(promotedId);
  });
});
