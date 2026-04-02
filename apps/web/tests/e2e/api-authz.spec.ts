import { test, expect } from "@playwright/test";

test.describe("API authorization", () => {
  test("GET /api/health exposes vault rate limit fields", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as {
      ok?: boolean;
      vaultMutationRateLimit?: string;
      vaultRedisStrict?: boolean;
    };
    expect(body.ok).toBe(true);
    expect(["memory", "redis"]).toContain(body.vaultMutationRateLimit);
    expect(typeof body.vaultRedisStrict).toBe("boolean");
  });

  test("GET /api/vault returns 403 without owner session", async ({ request }) => {
    const res = await request.get("/api/vault");
    expect(res.status()).toBe(403);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBe("forbidden");
  });

  test("GET /api/vault returns 200 after owner login", async ({ request }) => {
    const login = await request.post("/api/auth/login", {
      data: { accessCode: process.env.OWNER_ACCESS_CODE ?? "e2e-owner-code" },
      headers: { "content-type": "application/json" },
    });
    expect(login.ok()).toBeTruthy();

    const vault = await request.get("/api/vault");
    expect(vault.ok()).toBeTruthy();
    const body = (await vault.json()) as {
      ok?: boolean;
      items?: unknown[];
      encryption?: "configured" | "missing";
      decryption?: "configured" | "missing";
    };
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.encryption).toBe("configured");
    expect(body.decryption).toBe("configured");
  });

  test("POST /api/vault returns 403 without owner session", async ({ request }) => {
    const res = await request.post("/api/vault", {
      data: { note: "x" },
      headers: { "content-type": "application/json" },
    });
    expect(res.status()).toBe(403);
  });

  test("POST /api/vault/s3-upload-url returns 403 without owner session", async ({ request }) => {
    const res = await request.post("/api/vault/s3-upload-url");
    expect(res.status()).toBe(403);
  });

  test("POST /api/vault/s3-upload-url returns 501 when S3 vault bucket not configured", async ({ request }) => {
    const login = await request.post("/api/auth/login", {
      data: { accessCode: process.env.OWNER_ACCESS_CODE ?? "e2e-owner-code" },
      headers: { "content-type": "application/json" },
    });
    expect(login.ok()).toBeTruthy();
    const res = await request.post("/api/vault/s3-upload-url");
    expect(res.status()).toBe(501);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBe("s3_vault_not_configured");
  });

  test("POST /api/vault accepts placeholder after owner login", async ({ request }) => {
    const login = await request.post("/api/auth/login", {
      data: { accessCode: process.env.OWNER_ACCESS_CODE ?? "e2e-owner-code" },
      headers: { "content-type": "application/json" },
    });
    expect(login.ok()).toBeTruthy();

    const res = await request.post("/api/vault", {
      data: { note: "e2e vault note", tags: ["e2e"] },
      headers: { "content-type": "application/json" },
    });
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as { ok?: boolean; accepted?: boolean; persisted?: boolean };
    expect(body.ok).toBe(true);
    expect(body.accepted).toBe(true);
    expect(body.persisted).toBe(true);
  });
});
