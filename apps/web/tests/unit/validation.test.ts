import { describe, expect, it } from "vitest";
import {
  checkoutRequestSchema,
  createApplicationSchema,
  createReleaseAssetSchema,
  createVersionSchema,
  projectRequestSchema,
  updateProjectRequestSchema,
} from "@/lib/validation";

describe("createApplicationSchema", () => {
  it("accepts valid payload", () => {
    const result = createApplicationSchema.safeParse({
      slug: "wireless-ops-suite",
      name: "Wireless Ops Suite",
      summary: "A capable platform for wireless operations and testing workflows.",
      visibility: "PUBLIC",
      featured: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid slug", () => {
    const result = createApplicationSchema.safeParse({
      slug: "Bad Slug",
      name: "Name",
      summary: "A valid summary that has enough characters.",
    });
    expect(result.success).toBe(false);
  });
});

describe("checkoutRequestSchema", () => {
  it("accepts valid checkout payload", () => {
    const result = checkoutRequestSchema.safeParse({
      applicationId: "app_123",
      purchaserEmail: "buyer@example.com",
    });
    expect(result.success).toBe(true);
  });
});

describe("projectRequestSchema", () => {
  it("accepts valid payload with optional email", () => {
    const result = projectRequestSchema.safeParse({
      title: "Automation pipeline",
      description: "Need a reliable release pipeline with signing and audit logging.",
      contactEmail: "ops@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("accepts payload without email", () => {
    const result = projectRequestSchema.safeParse({
      title: "Automation pipeline",
      description: "Need a reliable release pipeline with signing and audit logging.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short description", () => {
    const result = projectRequestSchema.safeParse({
      title: "x",
      description: "short",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional honeypot website field", () => {
    const result = projectRequestSchema.safeParse({
      title: "Automation pipeline",
      description: "Need a reliable release pipeline with signing and audit logging.",
      website: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("updateProjectRequestSchema", () => {
  it("accepts status", () => {
    const result = updateProjectRequestSchema.safeParse({ status: "REVIEWING" });
    expect(result.success).toBe(true);
  });

  it("accepts archive flags", () => {
    expect(updateProjectRequestSchema.safeParse({ archived: true }).success).toBe(true);
    expect(updateProjectRequestSchema.safeParse({ archived: false }).success).toBe(true);
  });

  it("rejects empty object", () => {
    const result = updateProjectRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("release schemas", () => {
  it("accepts valid version payload", () => {
    const result = createVersionSchema.safeParse({
      applicationId: "app_123",
      version: "1.0.0",
      changelog: "Initial release.",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid release asset payload", () => {
    const result = createReleaseAssetSchema.safeParse({
      versionId: "ver_123",
      fileName: "installer.AppImage",
      fileUrl: "https://example.com/installer.AppImage",
      visibility: "ENTITLED",
    });
    expect(result.success).toBe(true);
  });
});
