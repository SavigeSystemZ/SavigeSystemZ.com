import { describe, expect, it } from "vitest";
import {
  applicationMediaUploadRequestSchema,
  applicationLaunchComposerSchema,
  applicationLaunchUploadRequestSchema,
  checkoutRequestSchema,
  creatorSubmissionSchema,
  createArchiveEntrySchema,
  createApplicationMediaSchema,
  createApplicationSchema,
  createReleaseAssetSchema,
  createVersionSchema,
  projectRequestSchema,
  releaseAssetUploadRequestSchema,
  updateApplicationSchema,
  updateApplicationMediaSchema,
  updateArchiveEntrySchema,
  updateCreatorSubmissionSchema,
  updateProjectRequestSchema,
  updateReleaseAssetSchema,
  updateVersionSchema,
  vaultPlaceholderSchema,
} from "@/lib/validation";

describe("createApplicationSchema", () => {
  it("accepts valid payload", () => {
    const result = createApplicationSchema.safeParse({
      slug: "wireless-ops-suite",
      name: "Wireless Ops Suite",
      summary: "A capable platform for wireless operations and testing workflows.",
      label: "Field platform",
      tagline: "Wireless assessment and operations workflows in one operator-grade control surface.",
      audience: "Security operators and research teams",
      priceLabel: "Licensed rollout",
      releaseChannel: "Controlled access",
      details: "Designed for recon, mapping, reporting, and disciplined evidence capture in the field.",
      highlights: "Signal inventory\nOperator workflow",
      surfaceAreas: "Assessment cockpit\nRelease control",
      stackItems: "Next.js\nPrisma",
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

  it("treats blank optional showcase fields as omitted", () => {
    const result = createApplicationSchema.safeParse({
      slug: "stack-launcher",
      name: "Stack Launcher",
      summary: "Installer and orchestration utility for full development stacks.",
      tagline: "",
      details: "",
      highlights: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("updateApplicationSchema", () => {
  it("rejects empty payload", () => {
    expect(updateApplicationSchema.safeParse({}).success).toBe(false);
  });

  it("accepts partial update payload", () => {
    expect(
      updateApplicationSchema.safeParse({
        tagline: "Updated launch framing for the public detail page.",
        featured: true,
      }).success,
    ).toBe(true);
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

describe("creatorSubmissionSchema", () => {
  it("accepts a valid creator submission", () => {
    expect(
      creatorSubmissionSchema.safeParse({
        title: "Signal OS Build Kit",
        type: "CONFIG_PACK",
        summary: "A curated Linux workstation layer with reproducible bootstrap, shell defaults, and field tooling.",
        details:
          "This submission packages shell automation, hardened defaults, terminal workflows, and bootstrap assets into a repeatable delivery candidate for moderation review.",
        plannedVisibility: "PRIVATE",
        contactEmail: "creator@example.com",
        repoUrl: "https://github.com/example/signal-os-build-kit",
        artifactUrl: "https://example.com/builds/signal-os-build-kit",
        website: "",
      }).success,
    ).toBe(true);
  });

  it("rejects short creator submission details", () => {
    expect(
      creatorSubmissionSchema.safeParse({
        title: "Signal OS Build Kit",
        type: "CONFIG_PACK",
        summary: "A curated Linux workstation layer with reproducible bootstrap and field tooling.",
        details: "too short",
      }).success,
    ).toBe(false);
  });
});

describe("updateCreatorSubmissionSchema", () => {
  it("accepts moderation status and notes", () => {
    expect(
      updateCreatorSubmissionSchema.safeParse({
        status: "REVIEWING",
        ownerNotes: "Needs packaging cleanup before approval.",
      }).success,
    ).toBe(true);
  });

  it("rejects empty creator submission updates", () => {
    expect(updateCreatorSubmissionSchema.safeParse({}).success).toBe(false);
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

  it("rejects release asset payload with only one s3 field", () => {
    const result = createReleaseAssetSchema.safeParse({
      versionId: "ver_123",
      fileName: "installer.AppImage",
      fileUrl: "https://example.com/installer.AppImage",
      s3Bucket: "bucket-only",
    });
    expect(result.success).toBe(false);
  });
});

describe("update release schemas", () => {
  it("rejects empty version update payload", () => {
    expect(updateVersionSchema.safeParse({}).success).toBe(false);
  });

  it("accepts version changelog update", () => {
    expect(
      updateVersionSchema.safeParse({
        changelog: "Refined packaging and release delivery.",
      }).success,
    ).toBe(true);
  });

  it("rejects empty asset update payload", () => {
    expect(updateReleaseAssetSchema.safeParse({}).success).toBe(false);
  });

  it("accepts paired s3 update payload", () => {
    expect(
      updateReleaseAssetSchema.safeParse({
        s3Bucket: "downloads",
        s3Key: "apps/build.zip",
      }).success,
    ).toBe(true);
  });

  it("rejects unpaired s3 update payload", () => {
    expect(
      updateReleaseAssetSchema.safeParse({
        s3Key: "apps/build.zip",
      }).success,
    ).toBe(false);
  });
});

describe("release asset upload request schema", () => {
  it("accepts a valid upload request", () => {
    expect(
      releaseAssetUploadRequestSchema.safeParse({
        versionId: "ver_123",
        fileName: "stack-launcher-1.0.0-linux-x64.tar.gz",
        contentType: "application/gzip",
      }).success,
    ).toBe(true);
  });

  it("rejects blank filenames", () => {
    expect(
      releaseAssetUploadRequestSchema.safeParse({
        versionId: "ver_123",
        fileName: "   ",
      }).success,
    ).toBe(false);
  });
});

describe("application media schemas", () => {
  it("accepts root-relative media URLs", () => {
    expect(
      createApplicationMediaSchema.safeParse({
        applicationId: "app_123",
        title: "Signal cartography command grid",
        altText: "A showcase image for the wireless command deck and mapped nodes.",
        description: "A flagship visual for the operator console.",
        mediaUrl: "/showcase/wireless-ops-suite-command-grid.svg",
        thumbnailUrl: "/showcase/wireless-ops-suite-signal-map.svg",
        featured: true,
        sortOrder: 10,
      }).success,
    ).toBe(true);
  });

  it("rejects media payloads with unpaired s3 fields", () => {
    expect(
      createApplicationMediaSchema.safeParse({
        applicationId: "app_123",
        title: "Signal cartography command grid",
        altText: "A showcase image for the wireless command deck and mapped nodes.",
        mediaUrl: "https://example.com/showcase/grid.png",
        s3Bucket: "media-only",
      }).success,
    ).toBe(false);
  });

  it("rejects empty media update payloads", () => {
    expect(updateApplicationMediaSchema.safeParse({}).success).toBe(false);
  });
});

describe("application media upload request schema", () => {
  it("accepts a valid media upload request", () => {
    expect(
      applicationMediaUploadRequestSchema.safeParse({
        applicationId: "app_123",
        fileName: "wireless-grid.png",
        contentType: "image/png",
      }).success,
    ).toBe(true);
  });

  it("rejects blank media upload filenames", () => {
    expect(
      applicationMediaUploadRequestSchema.safeParse({
        applicationId: "app_123",
        fileName: "   ",
      }).success,
    ).toBe(false);
  });
});

describe("application launch composer schema", () => {
  it("accepts a valid launch composer payload", () => {
    expect(
      applicationLaunchComposerSchema.safeParse({
        version: "1.0.0",
        changelog: "Initial public launch package.",
        fileName: "runtime-launch.zip",
        fileUrl: "https://example.com/runtime-launch.zip",
        visibility: "PUBLIC",
        publishAfterCreate: true,
      }).success,
    ).toBe(true);
  });

  it("rejects unpaired launch composer s3 fields", () => {
    expect(
      applicationLaunchComposerSchema.safeParse({
        version: "1.0.0",
        changelog: "Initial public launch package.",
        fileName: "runtime-launch.zip",
        fileUrl: "https://example.com/runtime-launch.zip",
        s3Bucket: "launch-only",
      }).success,
    ).toBe(false);
  });
});

describe("application launch upload request schema", () => {
  it("accepts a valid launch upload request", () => {
    expect(
      applicationLaunchUploadRequestSchema.safeParse({
        version: "1.0.0",
        fileName: "runtime-launch.zip",
        contentType: "application/zip",
      }).success,
    ).toBe(true);
  });

  it("rejects blank launch upload filenames", () => {
    expect(
      applicationLaunchUploadRequestSchema.safeParse({
        version: "1.0.0",
        fileName: "   ",
      }).success,
    ).toBe(false);
  });
});

describe("archive entry schemas", () => {
  it("accepts a valid archive entry payload", () => {
    expect(
      createArchiveEntrySchema.safeParse({
        slug: "dotfiles-control-layer",
        title: "Dotfiles Control Layer",
        summary: "Curated shell, terminal, rc, and automation config pack with reproducible rollout patterns.",
        category: "CONFIGURATION",
        visibility: "PUBLIC",
        featured: true,
        stageLabel: "Public archive drop",
        artifactFormat: "Config pack / rc files",
        details: "A strong configuration lane for shell environments and repeatable machine setup.",
        tags: "Dotfiles\nRC files",
        stackItems: "Zsh\nTmux",
        artifactUrl: "/downloads",
        artifactLabel: "See delivery lanes",
      }).success,
    ).toBe(true);
  });

  it("rejects empty archive entry update payloads", () => {
    expect(updateArchiveEntrySchema.safeParse({}).success).toBe(false);
  });

  it("accepts archive entry updates with root-relative preview URLs", () => {
    expect(
      updateArchiveEntrySchema.safeParse({
        previewImageUrl: "/showcase/wireless-ops-suite-command-grid.svg",
      }).success,
    ).toBe(true);
  });
});

describe("vaultPlaceholderSchema", () => {
  it("accepts empty object", () => {
    const result = vaultPlaceholderSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts note and tags", () => {
    const result = vaultPlaceholderSchema.safeParse({
      note: "Internal reference",
      tags: ["draft", "q1"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects too many tags", () => {
    const result = vaultPlaceholderSchema.safeParse({
      tags: Array.from({ length: 20 }, (_, i) => `t${i}`),
    });
    expect(result.success).toBe(false);
  });

  it("rejects s3Bucket without s3Key", () => {
    const result = vaultPlaceholderSchema.safeParse({ s3Bucket: "my-bucket" });
    expect(result.success).toBe(false);
  });

  it("accepts paired s3 fields", () => {
    const result = vaultPlaceholderSchema.safeParse({
      note: "with object",
      s3Bucket: "b",
      s3Key: "vault/user1/k",
    });
    expect(result.success).toBe(true);
  });
});
