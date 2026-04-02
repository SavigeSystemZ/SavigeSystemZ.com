import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const evalMock = vi.hoisted(() => vi.fn().mockResolvedValue(1));

vi.mock("ioredis", () => {
  const em = evalMock;
  return {
    default: class MockRedis {
      eval = em;
    },
  };
});

describe("vault rate limit (in-memory)", () => {
  beforeEach(() => {
    delete process.env.REDIS_URL;
    delete process.env.VAULT_REDIS_STRICT;
  });

  afterEach(() => {
    const g = globalThis as { __sszVaultRateLimitRedis?: { disconnect?: () => void } };
    g.__sszVaultRateLimitRedis?.disconnect?.();
    delete g.__sszVaultRateLimitRedis;
  });

  it("uses memory backend without REDIS_URL", async () => {
    vi.resetModules();
    const { vaultRateLimitBackend } = await import("@/lib/vault-rate-limit");
    expect(vaultRateLimitBackend()).toBe("memory");
  });

  it("returns 429 after 45 mutations per IP", async () => {
    vi.resetModules();
    const { vaultMutationGate } = await import("@/lib/vault-rate-limit");
    const ip = "10.99.88.77";
    const req = () =>
      new Request("http://localhost/", {
        headers: { "x-forwarded-for": ip },
      });
    for (let i = 0; i < 45; i++) {
      expect(await vaultMutationGate(req())).toBeNull();
    }
    const blocked = await vaultMutationGate(req());
    expect(blocked).not.toBeNull();
    expect(blocked!.status).toBe(429);
    const j = (await blocked!.json()) as { error: string };
    expect(j.error).toBe("rate_limited");
  });
});

describe("vault rate limit (redis path)", () => {
  beforeEach(() => {
    process.env.REDIS_URL = "redis://127.0.0.1:6379";
    delete process.env.VAULT_REDIS_STRICT;
    delete (globalThis as { __sszVaultRateLimitRedis?: unknown }).__sszVaultRateLimitRedis;
    evalMock.mockClear();
    evalMock.mockResolvedValue(1);
  });

  afterEach(() => {
    delete process.env.REDIS_URL;
    delete process.env.VAULT_REDIS_STRICT;
    const g = globalThis as { __sszVaultRateLimitRedis?: unknown };
    delete g.__sszVaultRateLimitRedis;
  });

  it("delegates to Redis eval when REDIS_URL is set", async () => {
    vi.resetModules();
    const { vaultMutationGate } = await import("@/lib/vault-rate-limit");
    const req = new Request("http://x", {
      headers: { "x-forwarded-for": "192.168.1.50" },
    });
    expect(await vaultMutationGate(req)).toBeNull();
    expect(evalMock).toHaveBeenCalledTimes(1);
  });

  it("returns 429 when Redis reports over limit", async () => {
    evalMock.mockResolvedValueOnce(0);
    vi.resetModules();
    const { vaultMutationGate } = await import("@/lib/vault-rate-limit");
    const req = new Request("http://x", {
      headers: { "x-forwarded-for": "192.168.1.51" },
    });
    const blocked = await vaultMutationGate(req);
    expect(blocked?.status).toBe(429);
  });

  it("falls back to memory when Redis eval rejects (non-strict)", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    evalMock.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    vi.resetModules();
    const { vaultMutationGate } = await import("@/lib/vault-rate-limit");
    const ip = "10.44.33.22";
    const req = () =>
      new Request("http://localhost/", {
        headers: { "x-forwarded-for": ip },
      });
    expect(await vaultMutationGate(req())).toBeNull();
    errSpy.mockRestore();
  });

  it("returns 503 when Redis fails and VAULT_REDIS_STRICT=1", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    process.env.VAULT_REDIS_STRICT = "1";
    evalMock.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    vi.resetModules();
    const { vaultMutationGate } = await import("@/lib/vault-rate-limit");
    const req = new Request("http://x", {
      headers: { "x-forwarded-for": "192.168.1.99" },
    });
    const blocked = await vaultMutationGate(req);
    expect(blocked?.status).toBe(503);
    const body = (await blocked!.json()) as { error: string };
    expect(body.error).toBe("rate_limit_backend_unavailable");
    errSpy.mockRestore();
  });
});
