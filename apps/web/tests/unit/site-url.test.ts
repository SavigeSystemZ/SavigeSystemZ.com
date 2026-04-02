import { afterEach, describe, expect, it } from "vitest";
import { getSiteUrl } from "@/lib/site-url";

describe("getSiteUrl", () => {
  const savedSite = process.env.SITE_URL;
  const savedVercel = process.env.VERCEL_URL;

  afterEach(() => {
    if (savedSite === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = savedSite;
    if (savedVercel === undefined) delete process.env.VERCEL_URL;
    else process.env.VERCEL_URL = savedVercel;
  });

  it("strips trailing slash from SITE_URL", () => {
    process.env.SITE_URL = "https://example.com/";
    delete process.env.VERCEL_URL;
    expect(getSiteUrl()).toBe("https://example.com");
  });

  it("builds from VERCEL_URL when SITE_URL unset", () => {
    delete process.env.SITE_URL;
    process.env.VERCEL_URL = "my-app.vercel.app";
    expect(getSiteUrl()).toBe("https://my-app.vercel.app");
  });

  it("defaults to production host when unset", () => {
    delete process.env.SITE_URL;
    delete process.env.VERCEL_URL;
    expect(getSiteUrl()).toBe("https://savigesystemz.com");
  });
});
