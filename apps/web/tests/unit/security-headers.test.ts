import { describe, expect, it } from "vitest";
import { buildSecurityHeaders, isHttpsRequest } from "@savige/security";

describe("isHttpsRequest", () => {
  it("detects x-forwarded-proto https", () => {
    const headers = new Headers({ "x-forwarded-proto": "https" });
    expect(isHttpsRequest({ headers })).toBe(true);
  });

  it("detects forwarded chain with https first", () => {
    const headers = new Headers({ "x-forwarded-proto": "https, http" });
    expect(isHttpsRequest({ headers })).toBe(true);
  });

  it("is false for plain http", () => {
    const headers = new Headers({ "x-forwarded-proto": "http" });
    expect(isHttpsRequest({ headers, nextUrl: { protocol: "http:" } })).toBe(false);
  });

  it("uses nextUrl protocol when no forwarded header", () => {
    expect(isHttpsRequest({ headers: new Headers(), nextUrl: { protocol: "https:" } })).toBe(true);
  });
});

describe("buildSecurityHeaders", () => {
  it("adds HSTS on https requests", () => {
    const h = buildSecurityHeaders({
      headers: new Headers({ "x-forwarded-proto": "https" }),
    });
    expect(h["Strict-Transport-Security"]).toContain("max-age=");
  });

  it("omits HSTS on http", () => {
    const h = buildSecurityHeaders({
      headers: new Headers(),
      nextUrl: { protocol: "http:" },
    });
    expect(h["Strict-Transport-Security"]).toBeUndefined();
  });

  it("includes baseline protections", () => {
    const h = buildSecurityHeaders({ headers: new Headers(), nextUrl: { protocol: "http:" } });
    expect(h["X-Frame-Options"]).toBe("DENY");
    expect(h["Content-Security-Policy"]).toContain("frame-ancestors");
  });
});
