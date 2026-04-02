import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const DEFAULT_PUT_EXPIRES = 900;

/**
 * Dedicated bucket for vault large blobs (must match POST /api/vault validation).
 */
export function getVaultS3Bucket(): string | null {
  const b = process.env.AWS_S3_VAULT_BUCKET?.trim();
  if (!b) return null;
  if (process.env.AWS_S3_PRESIGN_ENABLED === "0") return null;
  return b;
}

/**
 * Presigned PUT for `vault/{ownerUserId}/{uuid}`. Returns null if S3 is not configured.
 */
export async function presignVaultPutUrl(ownerUserId: string): Promise<{
  uploadUrl: string;
  bucket: string;
  key: string;
  expiresInSeconds: number;
} | null> {
  const bucket = getVaultS3Bucket();
  if (!bucket) return null;

  const region = process.env.AWS_REGION ?? "us-east-1";
  const key = `vault/${ownerUserId}/${randomUUID()}`;
  const expiresInSeconds = DEFAULT_PUT_EXPIRES;

  const kmsKeyId = process.env.AWS_S3_VAULT_SSE_KMS_KEY_ID?.trim();

  try {
    const client = new S3Client({ region });
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ...(kmsKeyId
        ? { ServerSideEncryption: "aws:kms" as const, SSEKMSKeyId: kmsKeyId }
        : {}),
    });
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
    return { uploadUrl, bucket, key, expiresInSeconds };
  } catch {
    return null;
  }
}
