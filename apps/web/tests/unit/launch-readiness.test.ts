import { describe, expect, it } from "vitest";
import { evaluateApplicationLaunchReadiness, evaluateArchiveLaunchReadiness } from "@/lib/launch-readiness";

describe("evaluateApplicationLaunchReadiness", () => {
  it("reports blockers for incomplete draft applications", () => {
    const readiness = evaluateApplicationLaunchReadiness({
      label: null,
      tagline: null,
      audience: null,
      priceLabel: null,
      releaseChannel: null,
      details: null,
      media: [],
      versions: [],
    });

    expect(readiness.ready).toBe(false);
    expect(readiness.blockers.length).toBeGreaterThanOrEqual(6);
  });

  it("marks applications ready when launch essentials are present", () => {
    const readiness = evaluateApplicationLaunchReadiness({
      label: "Field platform",
      tagline: "Operator-grade control surface for wireless workflows.",
      audience: "Security operators",
      priceLabel: "Licensed rollout",
      releaseChannel: "Controlled access",
      details: "Long-form launch framing for the public detail page.",
      media: [{ featured: true }],
      versions: [{ assets: [{ visibility: "PUBLIC" }] }],
    });

    expect(readiness.ready).toBe(true);
    expect(readiness.blockers).toHaveLength(0);
    expect(readiness.counts.publicAssets).toBe(1);
  });
});

describe("evaluateArchiveLaunchReadiness", () => {
  it("blocks archive publishing when critical framing is missing", () => {
    const readiness = evaluateArchiveLaunchReadiness({
      stageLabel: null,
      artifactFormat: null,
      details: null,
      artifactUrl: null,
    });

    expect(readiness.ready).toBe(false);
    expect(readiness.blockers).toContain("Add an artifact URL or route before publishing.");
  });

  it("allows archive publishing when launch essentials exist", () => {
    const readiness = evaluateArchiveLaunchReadiness({
      stageLabel: "Research lane",
      artifactFormat: "Docs / notes",
      details: "Long-form archive entry framing.",
      artifactUrl: "/downloads",
      artifactLabel: "See delivery lanes",
      previewImageUrl: "/showcase/example.svg",
      tags: "Research\nNotes",
      stackItems: "Markdown\nReview passes",
    });

    expect(readiness.ready).toBe(true);
    expect(readiness.blockers).toHaveLength(0);
  });
});
