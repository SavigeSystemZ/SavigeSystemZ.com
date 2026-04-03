import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const DEFAULT_PUT_EXPIRES = 900;

export function getReleaseS3Bucket(): string | null {
  const bucket = process.env.AWS_S3_RELEASE_BUCKET?.trim();
  if (!bucket) return null;
  if (process.env.AWS_S3_PRESIGN_ENABLED === "0") return null;
  return bucket;
}

function sanitizeFileName(fileName: string): string {
  const trimmed = fileName.trim();
  const normalized = trimmed
    .replace(/[\\/]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\.+/, "")
    .slice(0, 180);

  return normalized.length > 0 ? normalized : "artifact.bin";
}

function encodeS3Key(key: string): string {
  return key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export function buildS3ObjectUrl(bucket: string, key: string, region: string): string {
  const encodedKey = encodeS3Key(key);
  if (region === "us-east-1") {
    return `https://${bucket}.s3.amazonaws.com/${encodedKey}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
}

export async function presignReleaseAssetPutUrl(params: {
  appSlug: string;
  version: string;
  fileName: string;
  contentType?: string;
}): Promise<{
  uploadUrl: string;
  bucket: string;
  key: string;
  fileUrl: string;
  expiresInSeconds: number;
} | null> {
  const bucket = getReleaseS3Bucket();
  if (!bucket) return null;

  const region = process.env.AWS_REGION ?? "us-east-1";
  const safeFileName = sanitizeFileName(params.fileName);
  const key = `releases/${params.appSlug}/${params.version}/${randomUUID()}-${safeFileName}`;
  const expiresInSeconds = DEFAULT_PUT_EXPIRES;
  const kmsKeyId = process.env.AWS_S3_RELEASE_SSE_KMS_KEY_ID?.trim();

  try {
    const client = new S3Client({ region });
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ...(params.contentType ? { ContentType: params.contentType } : {}),
      ...(kmsKeyId
        ? { ServerSideEncryption: "aws:kms" as const, SSEKMSKeyId: kmsKeyId }
        : {}),
    });
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
    const fileUrl = buildS3ObjectUrl(bucket, key, region);
    return { uploadUrl, bucket, key, fileUrl, expiresInSeconds };
  } catch {
    return null;
  }
}
