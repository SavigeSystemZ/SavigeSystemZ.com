import { test, expect, type APIRequestContext } from "@playwright/test";
import { OWNER_CODE, seedOwnerSession } from "./helpers/owner-auth";

/** Helper: log in as owner via API and return authenticated request context. */
async function ownerLogin(request: APIRequestContext) {
  const login = await request.post("/api/auth/login", {
    data: { accessCode: OWNER_CODE },
    headers: { "content-type": "application/json" },
  });
  expect(login.ok()).toBeTruthy();
  return request;
}

test.describe.configure({ mode: "serial" });

test.describe("archive launch composer API", () => {
  test("POST /api/admin/archive/launch-compose returns 403 without owner session", async ({ request }) => {
    const res = await request.post("/api/admin/archive/launch-compose", {
      data: {},
      headers: { "content-type": "application/json" },
    });
    expect(res.status()).toBe(403);
  });

  test("POST /api/admin/archive/launch-compose rejects invalid payload", async ({ request }) => {
    await ownerLogin(request);
    const res = await request.post("/api/admin/archive/launch-compose", {
      data: { slug: "x" },
      headers: { "content-type": "application/json" },
    });
    expect(res.status()).toBe(400);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBe("invalid_payload");
  });

  test("POST /api/admin/archive/launch-compose creates draft entry", async ({ request }) => {
    await ownerLogin(request);
    const slug = `e2e-launch-${Date.now()}`;
    const res = await request.post("/api/admin/archive/launch-compose", {
      data: {
        slug,
        title: "E2E Launch Test",
        summary: "An end-to-end test for the archive launch composer flow.",
        category: "AUTOMATION",
        stageLabel: "E2E testing",
        artifactFormat: "Shell script bundle",
        details: "This archive entry was created by the E2E test suite to verify the launch composer API.",
        artifactUrl: "/downloads/e2e-test-artifact",
        publishAfterCreate: false,
      },
      headers: { "content-type": "application/json" },
    });
    expect(res.status()).toBe(201);
    const body = (await res.json()) as {
      item?: { slug: string; visibility: string };
      published?: boolean;
      launchReadiness?: { ready: boolean };
    };
    expect(body.item?.slug).toBe(slug);
    expect(body.item?.visibility).toBe("DRAFT");
    expect(body.published).toBe(false);
    expect(body.launchReadiness?.ready).toBe(true);
  });

  test("POST /api/admin/archive/launch-compose auto-publishes when requested and ready", async ({ request }) => {
    await ownerLogin(request);
    const slug = `e2e-autopub-${Date.now()}`;
    const res = await request.post("/api/admin/archive/launch-compose", {
      data: {
        slug,
        title: "E2E Auto Publish Test",
        summary: "Verifying that auto-publish works when all blockers are clear.",
        category: "RESEARCH",
        stageLabel: "Auto-publish verification",
        artifactFormat: "Markdown document",
        details: "This archive entry tests the auto-publish path of the launch composer.",
        artifactUrl: "/downloads/e2e-autopub-artifact",
        publishAfterCreate: true,
      },
      headers: { "content-type": "application/json" },
    });
    expect(res.status()).toBe(201);
    const body = (await res.json()) as {
      item?: { visibility: string };
      published?: boolean;
    };
    expect(body.item?.visibility).toBe("PUBLIC");
    expect(body.published).toBe(true);
  });

  test("POST /api/admin/archive/launch-compose rejects duplicate slug", async ({ request }) => {
    await ownerLogin(request);
    const slug = `e2e-dup-${Date.now()}`;
    const payload = {
      slug,
      title: "E2E Duplicate Test",
      summary: "First entry to test slug uniqueness enforcement.",
      category: "SECURITY_TOOL",
      stageLabel: "Duplicate test",
      artifactFormat: "Binary",
      details: "This entry exists to verify that the second creation attempt fails.",
      artifactUrl: "/downloads/e2e-dup",
      publishAfterCreate: false,
    };

    const first = await request.post("/api/admin/archive/launch-compose", {
      data: payload,
      headers: { "content-type": "application/json" },
    });
    expect(first.status()).toBe(201);

    const second = await request.post("/api/admin/archive/launch-compose", {
      data: payload,
      headers: { "content-type": "application/json" },
    });
    expect(second.status()).toBe(409);
    const body = (await second.json()) as { error?: string };
    expect(body.error).toBe("slug_exists");
  });
});

test.describe("archive publish API", () => {
  test("POST /api/admin/archive/[id]/publish returns 403 without owner session", async ({ request }) => {
    const res = await request.post("/api/admin/archive/fake-id/publish");
    expect(res.status()).toBe(403);
  });

  test("POST /api/admin/archive/[id]/publish returns 404 for missing entry", async ({ request }) => {
    await ownerLogin(request);
    const res = await request.post("/api/admin/archive/nonexistent-id/publish");
    expect(res.status()).toBe(404);
  });
});

test.describe("archive admin UI", () => {
  test("archive manager loads and shows launch composer toggle", async ({ page, request }) => {
    await seedOwnerSession(request, page);
    await page.goto("/admin/archive");
    await expect(page.getByRole("heading", { name: "Archive Manager" })).toBeVisible();
    await expect(page.getByText("Archive Launch Composer")).toBeVisible();

    // Open the composer
    await page.getByRole("button", { name: "Open composer" }).click();
    await expect(page.getByPlaceholder("slug (e.g. signal-os-build-kit)")).toBeVisible();

    // Close it
    await page.getByRole("button", { name: "Close composer" }).click();
    await expect(page.getByPlaceholder("slug (e.g. signal-os-build-kit)")).not.toBeVisible();
  });
});
