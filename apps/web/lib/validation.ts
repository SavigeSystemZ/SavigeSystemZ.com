import { z } from "zod";

const slugSchema = z
  .string()
  .min(3)
  .max(64)
  .regex(/^[a-z0-9-]+$/);

const nameSchema = z.string().min(2).max(120);
const summarySchema = z.string().min(10).max(500);
const applicationVisibilitySchema = z.enum(["PUBLIC", "PRIVATE", "DRAFT"]);
const urlOrRootRelativeSchema = z.string().url().or(z.string().regex(/^\/[a-zA-Z0-9/_\-.]+$/));
const optionalUrlOrRootRelativeSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, urlOrRootRelativeSchema.optional());
const optionalUrlSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, z.string().url().optional());

function optionalTrimmedText(max: number, min = 1) {
  return z.preprocess((value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }, z.string().min(min).max(max).optional());
}

function hasDefinedValue(data: Record<string, unknown>): boolean {
  return Object.values(data).some((value) => value !== undefined);
}

const applicationShowcaseFields = {
  label: optionalTrimmedText(60, 2),
  tagline: optionalTrimmedText(180, 10),
  audience: optionalTrimmedText(140, 4),
  priceLabel: optionalTrimmedText(100, 2),
  releaseChannel: optionalTrimmedText(100, 2),
  details: optionalTrimmedText(2000, 20),
  highlights: optionalTrimmedText(1200, 2),
  surfaceAreas: optionalTrimmedText(1200, 2),
  stackItems: optionalTrimmedText(1200, 2),
};

export const createApplicationSchema = z.object({
  slug: slugSchema,
  name: nameSchema,
  summary: summarySchema,
  visibility: applicationVisibilitySchema.default("DRAFT"),
  featured: z.boolean().default(false),
  ...applicationShowcaseFields,
});

export const updateApplicationSchema = z
  .object({
    slug: slugSchema.optional(),
    name: nameSchema.optional(),
    summary: summarySchema.optional(),
    visibility: applicationVisibilitySchema.optional(),
    featured: z.boolean().optional(),
    ...applicationShowcaseFields,
  })
  .refine((data) => hasDefinedValue(data), {
    message: "at_least_one_field",
  });

export const createVersionSchema = z.object({
  applicationId: z.string().min(2),
  version: z.string().min(1).max(32),
  changelog: z.string().min(3).max(5000),
});

export const updateVersionSchema = createVersionSchema.partial().refine((data) => hasDefinedValue(data), {
  message: "at_least_one_field",
});

const optionalTrimmedReleaseText = (max: number) =>
  z.preprocess((value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }, z.string().min(1).max(max).optional());

const assetVisibilitySchema = z.enum(["PUBLIC", "ENTITLED", "PRIVATE"]);

const releaseAssetFields = {
  versionId: z.string().min(2),
  fileName: z.string().min(1).max(255),
  fileUrl: z.string().url(),
  s3Bucket: optionalTrimmedReleaseText(255),
  s3Key: optionalTrimmedReleaseText(1024),
  checksum: optionalTrimmedReleaseText(255),
  visibility: assetVisibilitySchema,
};

const createReleaseAssetBaseSchema = z
  .object({
    ...releaseAssetFields,
    visibility: assetVisibilitySchema.default("PUBLIC"),
  })
  .refine(
    (data) =>
      (!data.s3Bucket && !data.s3Key) || (Boolean(data.s3Bucket?.length) && Boolean(data.s3Key?.length)),
    { message: "s3_bucket_and_key_required_together", path: ["s3Key"] },
  );

export const createReleaseAssetSchema = createReleaseAssetBaseSchema;

export const updateReleaseAssetSchema = z
  .object({
    versionId: releaseAssetFields.versionId.optional(),
    fileName: releaseAssetFields.fileName.optional(),
    fileUrl: releaseAssetFields.fileUrl.optional(),
    s3Bucket: releaseAssetFields.s3Bucket,
    s3Key: releaseAssetFields.s3Key,
    checksum: releaseAssetFields.checksum,
    visibility: releaseAssetFields.visibility.optional(),
  })
  .refine((data) => hasDefinedValue(data), {
    message: "at_least_one_field",
  })
  .refine(
    (data) =>
      (data.s3Bucket === undefined && data.s3Key === undefined) ||
      (Boolean(data.s3Bucket?.length) && Boolean(data.s3Key?.length)),
    { message: "s3_bucket_and_key_required_together", path: ["s3Key"] },
  );

export const releaseAssetUploadRequestSchema = z.object({
  versionId: z.string().min(2),
  fileName: z.string().trim().min(1).max(255),
  contentType: optionalTrimmedText(200),
});

export const applicationLaunchUploadRequestSchema = z.object({
  version: z.string().trim().min(1).max(32),
  fileName: z.string().trim().min(1).max(255),
  contentType: optionalTrimmedText(200),
});

export const createApplicationMediaSchema = z
  .object({
    applicationId: z.string().min(2),
    title: z.string().trim().min(2).max(140),
    altText: z.string().trim().min(5).max(240),
    description: optionalTrimmedText(1200, 10),
    mediaUrl: urlOrRootRelativeSchema,
    thumbnailUrl: urlOrRootRelativeSchema.optional(),
    s3Bucket: optionalTrimmedReleaseText(255),
    s3Key: optionalTrimmedReleaseText(1024),
    featured: z.boolean().default(false),
    sortOrder: z.number().int().min(0).max(10000).default(0),
  })
  .refine(
    (data) =>
      (!data.s3Bucket && !data.s3Key) || (Boolean(data.s3Bucket?.length) && Boolean(data.s3Key?.length)),
    { message: "s3_bucket_and_key_required_together", path: ["s3Key"] },
  );

export const updateApplicationMediaSchema = z
  .object({
    applicationId: z.string().min(2).optional(),
    title: z.string().trim().min(2).max(140).optional(),
    altText: z.string().trim().min(5).max(240).optional(),
    description: optionalTrimmedText(1200, 10),
    mediaUrl: urlOrRootRelativeSchema.optional(),
    thumbnailUrl: urlOrRootRelativeSchema.optional(),
    s3Bucket: optionalTrimmedReleaseText(255),
    s3Key: optionalTrimmedReleaseText(1024),
    featured: z.boolean().optional(),
    sortOrder: z.number().int().min(0).max(10000).optional(),
  })
  .refine((data) => hasDefinedValue(data), {
    message: "at_least_one_field",
  })
  .refine(
    (data) =>
      (data.s3Bucket === undefined && data.s3Key === undefined) ||
      (Boolean(data.s3Bucket?.length) && Boolean(data.s3Key?.length)),
    { message: "s3_bucket_and_key_required_together", path: ["s3Key"] },
  );

export const applicationMediaUploadRequestSchema = z.object({
  applicationId: z.string().min(2),
  fileName: z.string().trim().min(1).max(255),
  contentType: optionalTrimmedText(200),
});

export const applicationLaunchComposerSchema = z
  .object({
    version: z.string().trim().min(1).max(32),
    changelog: z.string().trim().min(3).max(5000),
    fileName: z.string().trim().min(1).max(255),
    fileUrl: z.string().url(),
    checksum: optionalTrimmedReleaseText(255),
    s3Bucket: optionalTrimmedReleaseText(255),
    s3Key: optionalTrimmedReleaseText(1024),
    visibility: assetVisibilitySchema.default("PUBLIC"),
    publishAfterCreate: z.boolean().default(false),
  })
  .refine(
    (data) =>
      (!data.s3Bucket && !data.s3Key) || (Boolean(data.s3Bucket?.length) && Boolean(data.s3Key?.length)),
    { message: "s3_bucket_and_key_required_together", path: ["s3Key"] },
  );

const archiveCategorySchema = z.enum([
  "OPERATING_SYSTEM",
  "AUTOMATION",
  "CONFIGURATION",
  "CONTAINER_STACK",
  "VIRTUAL_MACHINE",
  "MODEL",
  "RESEARCH",
  "WRITING",
  "SECURITY_TOOL",
]);

const archiveEntryFields = {
  slug: slugSchema,
  title: z.string().trim().min(2).max(140),
  summary: summarySchema,
  category: archiveCategorySchema,
  visibility: applicationVisibilitySchema,
  featured: z.boolean(),
  stageLabel: optionalTrimmedText(100, 2),
  artifactFormat: optionalTrimmedText(120, 2),
  previewImageUrl: optionalUrlOrRootRelativeSchema,
  previewThumbnailUrl: optionalUrlOrRootRelativeSchema,
  details: optionalTrimmedText(4000, 20),
  tags: optionalTrimmedText(1400, 2),
  stackItems: optionalTrimmedText(1400, 2),
  artifactUrl: optionalUrlOrRootRelativeSchema,
  artifactLabel: optionalTrimmedText(60, 2),
};

export const createArchiveEntrySchema = z.object({
  ...archiveEntryFields,
  visibility: applicationVisibilitySchema.default("DRAFT"),
  featured: z.boolean().default(false),
});

export const updateArchiveEntrySchema = z
  .object({
    slug: archiveEntryFields.slug.optional(),
    title: archiveEntryFields.title.optional(),
    summary: archiveEntryFields.summary.optional(),
    category: archiveEntryFields.category.optional(),
    visibility: archiveEntryFields.visibility.optional(),
    featured: archiveEntryFields.featured.optional(),
    stageLabel: archiveEntryFields.stageLabel,
    artifactFormat: archiveEntryFields.artifactFormat,
    previewImageUrl: archiveEntryFields.previewImageUrl,
    previewThumbnailUrl: archiveEntryFields.previewThumbnailUrl,
    details: archiveEntryFields.details,
    tags: archiveEntryFields.tags,
    stackItems: archiveEntryFields.stackItems,
    artifactUrl: archiveEntryFields.artifactUrl,
    artifactLabel: archiveEntryFields.artifactLabel,
  })
  .refine((data) => hasDefinedValue(data), {
    message: "at_least_one_field",
  });

export const archiveLaunchComposerSchema = z.object({
  slug: archiveEntryFields.slug,
  title: archiveEntryFields.title,
  summary: archiveEntryFields.summary,
  category: archiveEntryFields.category,
  featured: z.boolean().default(false),
  stageLabel: z.string().trim().min(2).max(100),
  artifactFormat: z.string().trim().min(2).max(120),
  details: z.string().trim().min(20).max(4000),
  artifactUrl: z.string().trim().min(1).max(2000),
  artifactLabel: optionalTrimmedText(60, 2),
  previewImageUrl: optionalUrlOrRootRelativeSchema,
  previewThumbnailUrl: optionalUrlOrRootRelativeSchema,
  tags: optionalTrimmedText(1400, 2),
  stackItems: optionalTrimmedText(1400, 2),
  publishAfterCreate: z.boolean().default(false),
});

export const checkoutRequestSchema = z.object({
  applicationId: z.string().min(1),
  purchaserEmail: z.string().email(),
});

export const donateRequestSchema = z.object({
  applicationId: z.string().min(1),
  donorEmail: z.string().email().max(320).optional(),
});

export const projectRequestSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(10).max(8000),
  contactEmail: z.string().email().max(320).optional(),
  /** Honeypot — must be empty; not persisted. */
  website: z.string().optional(),
});

const creatorSubmissionTypeSchema = z.enum([
  "APPLICATION",
  "ARCHIVE_ENTRY",
  "CONFIG_PACK",
  "CONTAINER_STACK",
  "MODEL",
  "RESEARCH",
  "SECURITY_TOOL",
  "AUTOMATION",
]);

export const creatorSubmissionSchema = z.object({
  title: z.string().trim().min(3).max(140),
  type: creatorSubmissionTypeSchema,
  summary: z.string().trim().min(20).max(500),
  details: z.string().trim().min(30).max(6000),
  plannedVisibility: applicationVisibilitySchema.default("DRAFT"),
  contactEmail: z.string().email().max(320).optional(),
  repoUrl: optionalUrlSchema,
  artifactUrl: optionalUrlSchema,
  /** Honeypot — must be empty; not persisted. */
  website: z.string().optional(),
});

export const updateCreatorSubmissionSchema = z
  .object({
    status: z.enum(["PENDING", "REVIEWING", "APPROVED", "HOLD", "REJECTED"]).optional(),
    ownerNotes: optionalTrimmedText(4000, 2),
    archived: z.boolean().optional(),
  })
  .refine((data) => hasDefinedValue(data), {
    message: "at_least_one_field",
  });

export const updateProjectRequestSchema = z
  .object({
    status: z.enum(["PENDING", "REVIEWING", "CLOSED"]).optional(),
    archived: z.boolean().optional(),
  })
  .refine((data) => data.status !== undefined || data.archived !== undefined, {
    message: "at_least_one_field",
  });

/** Vault metadata; optional S3 pointer must be a pair (use keys from POST /api/vault/s3-upload-url only). */
export const vaultPlaceholderSchema = z
  .object({
    note: z.string().trim().max(2000).optional(),
    tags: z.array(z.string().trim().min(1).max(64)).max(12).optional(),
    s3Bucket: z.string().trim().min(1).max(255).optional(),
    s3Key: z.string().trim().min(1).max(1024).optional(),
  })
  .refine(
    (d) =>
      (!d.s3Bucket && !d.s3Key) || (Boolean(d.s3Bucket?.length) && Boolean(d.s3Key?.length)),
    { message: "s3_bucket_and_key_required_together", path: ["s3Key"] },
  );
