import { describe, expect, it } from "vitest";
import { buildProjectDonateExternalUrl, getDonateConfig } from "@/lib/donate-config";

describe("donate-config", () => {
  it("defaults to GitHub Sponsors for whyte when env is unset", () => {
    const original = process.env.FOUNDER_DONATE_URL;
    const originalUser = process.env.FOUNDER_GITHUB_SPONSORS_USERNAME;
    delete process.env.FOUNDER_DONATE_URL;
    delete process.env.FOUNDER_GITHUB_SPONSORS_USERNAME;

    const config = getDonateConfig();
    expect(config.externalUrl).toBe("https://github.com/sponsors/whyte");
    expect(config.githubSponsorsUsername).toBe("whyte");

    if (original !== undefined) process.env.FOUNDER_DONATE_URL = original;
    if (originalUser !== undefined) process.env.FOUNDER_GITHUB_SPONSORS_USERNAME = originalUser;
  });

  it("tags external donate URLs with per-project UTM params", () => {
    const url = buildProjectDonateExternalUrl("https://github.com/sponsors/whyte", "immortality");
    expect(url).toContain("utm_campaign=immortality");
    expect(url).toContain("utm_source=savigesystemz.com");
  });
});
