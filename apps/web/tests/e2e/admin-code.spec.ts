import { test, expect } from "@playwright/test";

const OWNER_CODE = process.env.OWNER_ACCESS_CODE ?? "e2e-owner-code";

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

  test("owner can list the (initially empty) repositories", async ({ request }) => {
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
});
