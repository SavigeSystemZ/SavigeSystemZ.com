import { describe, expect, it } from "vitest";
import { archiveCatalog } from "@/lib/archive-catalog";
import { appCatalog } from "@/lib/catalog";
import { buildConciergeReply } from "@/lib/concierge";

const knowledge = {
  applications: appCatalog.map((application) => ({
    ...application,
    media: [],
    versions: [],
    codeRepository: null,
  })),
  archiveEntries: archiveCatalog,
};

describe("buildConciergeReply", () => {
  it("routes archive-style prompts into the archive lane", () => {
    const reply = buildConciergeReply("Show me linux builds, dotfiles, and config packs", knowledge);
    expect(reply.topic).toBe("archive");
    expect(reply.routes.some((route) => route.href === "/archive")).toBe(true);
    expect(reply.highlights.join(" ")).toContain("Signal OS Build Kit");
  });

  it("routes custom build prompts into services and pricing", () => {
    const reply = buildConciergeReply("I need a custom internal automation build for my team", knowledge);
    expect(reply.topic).toBe("services");
    expect(reply.routes.some((route) => route.href === "/services")).toBe(true);
    expect(reply.routes.some((route) => route.href === "/pricing")).toBe(true);
  });

  it("finds direct application matches from user prompts", () => {
    const reply = buildConciergeReply("Tell me about wireless ops suite release control", knowledge);
    expect(reply.topic).toBe("applications");
    expect(reply.routes[0]?.href).toBe("/applications/wireless-ops-suite");
    expect(reply.answer).toContain("Wireless Ops Suite");
  });
});
