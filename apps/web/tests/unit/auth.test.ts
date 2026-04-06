import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock next/headers before importing auth module
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({ get: () => undefined })),
}));
vi.mock("next/server", async () => {
  const actual = await vi.importActual<typeof import("next/server")>("next/server");
  return actual;
});
vi.mock("@/lib/db", () => ({ db: {} }));

describe("auth — pure functions", () => {
  beforeEach(() => {
    process.env.OWNER_LOGIN_SECRET = "test-secret-32-characters-long!";
    process.env.OWNER_ACCESS_CODE = "correct-owner-code";
  });

  describe("buildSessionCookie + decodeSessionToken round-trip", async () => {
    const { buildSessionCookie } = await import("@/lib/auth");

    it("signs and verifies a session token", () => {
      const token = "abc123";
      const cookie = buildSessionCookie(token);
      expect(cookie).toContain(".");
      const [raw, sig] = cookie.split(".");
      expect(raw).toBe(token);
      expect(sig).toHaveLength(64); // sha256 hex
    });

    it("produces different signatures for different tokens", () => {
      const a = buildSessionCookie("token-a");
      const b = buildSessionCookie("token-b");
      expect(a.split(".")[1]).not.toBe(b.split(".")[1]);
    });

    it("produces consistent signatures for the same token", () => {
      const a = buildSessionCookie("same-token");
      const b = buildSessionCookie("same-token");
      expect(a).toBe(b);
    });
  });

  describe("isValidOwnerAccessCode", async () => {
    const { isValidOwnerAccessCode } = await import("@/lib/auth");

    it("returns true for correct code", () => {
      expect(isValidOwnerAccessCode("correct-owner-code")).toBe(true);
    });

    it("returns false for wrong code", () => {
      expect(isValidOwnerAccessCode("wrong-code")).toBe(false);
    });

    it("returns false for empty string", () => {
      expect(isValidOwnerAccessCode("")).toBe(false);
    });

    it("returns false for substring match", () => {
      expect(isValidOwnerAccessCode("correct-owner")).toBe(false);
    });

    it("returns false for superstring match", () => {
      expect(isValidOwnerAccessCode("correct-owner-code-extra")).toBe(false);
    });

    it("returns false when OWNER_ACCESS_CODE is unset", () => {
      delete process.env.OWNER_ACCESS_CODE;
      expect(isValidOwnerAccessCode("anything")).toBe(false);
    });
  });

  describe("requireOwner", async () => {
    const { requireOwner } = await import("@/lib/auth");

    it("returns null for owner context", () => {
      const result = requireOwner({ userId: "user-1", role: "owner" });
      expect(result).toBeNull();
    });

    it("returns 403 for user context", async () => {
      const result = requireOwner({ userId: "user-1", role: "user" });
      expect(result).not.toBeNull();
      expect(result?.status).toBe(403);
    });

    it("returns 403 for anonymous context", async () => {
      const result = requireOwner({ userId: null, role: "anonymous" });
      expect(result).not.toBeNull();
      expect(result?.status).toBe(403);
    });

    it("returns 403 for owner role with null userId", async () => {
      const result = requireOwner({ userId: null, role: "owner" });
      expect(result).not.toBeNull();
      expect(result?.status).toBe(403);
    });
  });

  describe("getSessionCookieName", async () => {
    const { getSessionCookieName } = await import("@/lib/auth");

    it("returns the expected cookie name", () => {
      expect(getSessionCookieName()).toBe("sz_session");
    });
  });

  describe("getSessionMaxAgeSeconds", async () => {
    const { getSessionMaxAgeSeconds } = await import("@/lib/auth");

    it("returns 12 hours in seconds", () => {
      expect(getSessionMaxAgeSeconds()).toBe(43200);
    });
  });
});
