import { describe, expect, it } from "vitest";
import {
  getCatalogLaunchEntry,
  inferLaunchUrlFromEnvExample,
  normalizeLaunchUrl,
} from "@/lib/catalog-launch-registry";

describe("catalog-launch-registry", () => {
  it("resolves flagship entries by slug", () => {
    const entry = getCatalogLaunchEntry("immortality", "Immortality");
    expect(entry?.launchUrl).toBe("http://127.0.0.1:3777");
    expect(entry?.surface).toBe("web");
  });

  it("marks etherweave as desktop-only", () => {
    const entry = getCatalogLaunchEntry("etherweave", "etherweave");
    expect(entry?.surface).toBe("desktop");
    expect(entry?.launchUrl).toBeUndefined();
  });

  it("infers launch URL from NEXT_PUBLIC_APP_URL", () => {
    const url = inferLaunchUrlFromEnvExample(
      'NEXT_PUBLIC_APP_URL="http://localhost:3777"\nPORT=9999\n',
    );
    expect(url).toBe("http://127.0.0.1:3777");
  });

  it("infers launch URL from PORT when no public URL", () => {
    const url = inferLaunchUrlFromEnvExample("PORT=3847\n");
    expect(url).toBe("http://127.0.0.1:3847");
  });

  it("normalizes localhost to 127.0.0.1", () => {
    expect(normalizeLaunchUrl("http://localhost:3000/")).toBe("http://127.0.0.1:3000");
  });
});
