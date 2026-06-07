import { test, expect } from "@playwright/test";
import { createHmac } from "node:crypto";

const OWNER_CODE = process.env.OWNER_ACCESS_CODE ?? process.env.E2E_OWNER_CODE ?? "e2e-owner-code";
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET ?? "e2e-github-webhook-secret";

test.describe.configure({ mode: "serial" });

test.describe("admin /code (Code module)", () => {
  test("GET /api/admin/code returns 403 without owner session", async ({ request }) => {
    const res = await request.get("/api/admin/code");
    expect(res.status()).toBe(403);
  });

  test("POST /api/admin/code returns 403 without owner session", async ({ request }) => {
    const res = await request.post("/api/admin/code", {
      data: { githubRef: "octocat/Hello-World" },
      headers: { "content-type": "application/json" },
    });
    expect(res.status()).toBe(403);
  });

  test("owner can list tracked repositories", async ({ request }) => {
    const login = await request.post("/api/auth/login", {
      data: { accessCode: OWNER_CODE },
      headers: { "content-type": "application/json" },
    });
    expect(login.ok()).toBeTruthy();

    const list = await request.get("/api/admin/code");
    expect(list.ok()).toBeTruthy();
    const body = (await list.json()) as { items: unknown[] };
    expect(Array.isArray(body.items)).toBe(true);
  });

  test("owner gets a 400 with useful error on an unparseable ref", async ({ request }) => {
    const login = await request.post("/api/auth/login", {
      data: { accessCode: OWNER_CODE },
      headers: { "content-type": "application/json" },
    });
    expect(login.ok()).toBeTruthy();

    const res = await request.post("/api/admin/code", {
      data: { githubRef: "not a valid ref" },
      headers: { "content-type": "application/json" },
    });
    expect(res.status()).toBe(400);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toMatch(/parse GitHub ref/i);
  });

  test("owner gets a 400 on malformed body", async ({ request }) => {
    const login = await request.post("/api/auth/login", {
      data: { accessCode: OWNER_CODE },
      headers: { "content-type": "application/json" },
    });
    expect(login.ok()).toBeTruthy();

    const res = await request.post("/api/admin/code", {
      data: { notAField: true },
      headers: { "content-type": "application/json" },
    });
    expect(res.status()).toBe(400);
  });

  test("PATCH /api/admin/code/:id returns 403 without owner session", async ({ request }) => {
    const res = await request.patch("/api/admin/code/any-id", {
      data: { applicationIds: [] },
      headers: { "content-type": "application/json" },
    });
    expect(res.status()).toBe(403);
  });

  test("owner gets a 404 when linking apps on a non-existent repo", async ({ request }) => {
    const login = await request.post("/api/auth/login", {
      data: { accessCode: OWNER_CODE },
      headers: { "content-type": "application/json" },
    });
    expect(login.ok()).toBeTruthy();

    const res = await request.patch("/api/admin/code/does-not-exist", {
      data: { applicationIds: [] },
      headers: { "content-type": "application/json" },
    });
    expect(res.status()).toBe(404);
  });

  test("owner gets a 400 on a malformed PATCH body", async ({ request }) => {
    const login = await request.post("/api/auth/login", {
      data: { accessCode: OWNER_CODE },
      headers: { "content-type": "application/json" },
    });
    expect(login.ok()).toBeTruthy();

    const res = await request.patch("/api/admin/code/any-id", {
      data: { applicationIds: "not-an-array" },
      headers: { "content-type": "application/json" },
    });
    expect(res.status()).toBe(400);
  });

  test("GET /api/admin/code includes the applications index for linking", async ({ request }) => {
    const login = await request.post("/api/auth/login", {
      data: { accessCode: OWNER_CODE },
      headers: { "content-type": "application/json" },
    });
    expect(login.ok()).toBeTruthy();

    const list = await request.get("/api/admin/code");
    expect(list.ok()).toBeTruthy();
    const body = (await list.json()) as { items: unknown[]; applications: unknown[] };
    expect(Array.isArray(body.applications)).toBe(true);
  });

  test("owner page /admin/code renders the Code heading", async ({ page, request }) => {
    const login = await request.post("/api/auth/login", {
      data: { accessCode: OWNER_CODE },
      headers: { "content-type": "application/json" },
    });
    expect(login.ok()).toBeTruthy();

    const cookies = await request.storageState();
    await page.context().addCookies(cookies.cookies);

    await page.goto("/admin/code");
    await expect(page.getByRole("heading", { name: /code repositories/i })).toBeVisible();
    await expect(page.getByPlaceholder(/owner\/repo/i)).toBeVisible();
  });

  test("owner can connect, publish, sync, and webhook-sync a repository", async ({ request }) => {
    const login = await request.post("/api/auth/login", {
      data: { accessCode: OWNER_CODE },
      headers: { "content-type": "application/json" },
    });
    expect(login.ok()).toBeTruthy();

    const createRes = await request.post("/api/admin/code", {
      data: { githubRef: "octocat/hello-world" },
      headers: { "content-type": "application/json" },
    });

    let createdBody: { item: { id: string; slug: string; visibility: string } };
    if (createRes.ok()) {
      createdBody = (await createRes.json()) as typeof createdBody;
    } else {
      const listRes = await request.get("/api/admin/code");
      expect(listRes.ok()).toBeTruthy();
      const listBody = (await listRes.json()) as { items: Array<{ id: string; slug: string; visibility: string }> };
      const existing = listBody.items.find((item) => item.slug === "octocat-hello-world");
      expect(existing).toBeTruthy();
      createdBody = { item: existing! };
    }
    expect(createdBody.item.slug).toBe("octocat-hello-world");

    const publishRes = await request.patch(`/api/admin/code/${createdBody.item.id}`, {
      data: { visibility: "PUBLIC" },
      headers: { "content-type": "application/json" },
    });
    expect(publishRes.ok()).toBeTruthy();
    const publishBody = (await publishRes.json()) as { item: { visibility: string } };
    expect(publishBody.item.visibility).toBe("PUBLIC");

    const syncRes = await request.post(`/api/admin/code/${createdBody.item.id}`);
    expect(syncRes.ok()).toBeTruthy();
    const syncBody = (await syncRes.json()) as { item: { syncStatus: string } };
    expect(syncBody.item.syncStatus).toBe("OK");

    const webhookPayload = JSON.stringify({
      repository: {
        owner: { login: "octocat" },
        name: "hello-world",
      },
    });
    const signature = `sha256=${createHmac("sha256", GITHUB_WEBHOOK_SECRET)
      .update(webhookPayload)
      .digest("hex")}`;

    const webhookRes = await request.post("/api/webhooks/github", {
      data: webhookPayload,
      headers: {
        "content-type": "application/json",
        "x-github-event": "push",
        "x-hub-signature-256": signature,
      },
    });
    expect(webhookRes.ok()).toBeTruthy();
    const webhookBody = (await webhookRes.json()) as { ok: boolean; syncStatus?: string };
    expect(webhookBody.ok).toBe(true);
    expect(webhookBody.syncStatus).toBe("OK");
  });
});
