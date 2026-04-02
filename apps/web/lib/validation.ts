import { z } from "zod";

export const createApplicationSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(64)
    .regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(120),
  summary: z.string().min(10).max(500),
  visibility: z.enum(["PUBLIC", "PRIVATE", "DRAFT"]).default("DRAFT"),
  featured: z.boolean().default(false),
});

export const updateApplicationSchema = createApplicationSchema.partial();

export const createVersionSchema = z.object({
  applicationId: z.string().min(2),
  version: z.string().min(1).max(32),
  changelog: z.string().min(3).max(5000),
});

export const updateVersionSchema = createVersionSchema.partial();

export const createReleaseAssetSchema = z.object({
  versionId: z.string().min(2),
  fileName: z.string().min(1).max(255),
  fileUrl: z.string().url(),
  s3Bucket: z.string().min(1).max(255).optional(),
  s3Key: z.string().min(1).max(1024).optional(),
  checksum: z.string().max(255).optional(),
  visibility: z.enum(["PUBLIC", "ENTITLED", "PRIVATE"]).default("PUBLIC"),
});

export const updateReleaseAssetSchema = createReleaseAssetSchema.partial();

export const checkoutRequestSchema = z.object({
  applicationId: z.string().min(1),
  purchaserEmail: z.string().email(),
});

export const projectRequestSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(10).max(8000),
  contactEmail: z.string().email().max(320).optional(),
  /** Honeypot — must be empty; not persisted. */
  website: z.string().optional(),
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
