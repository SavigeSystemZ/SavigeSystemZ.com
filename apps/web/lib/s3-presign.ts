import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const DEFAULT_EXPIRES = 300;

/**
 * Returns a time-limited HTTPS URL for GET when AWS credentials and bucket/key are valid.
 * On failure or when presigning is disabled, returns null so callers can fall back to `fileUrl`.
 */
export async function presignS3GetUrl(params: {
  bucket: string;
  key: string;
  expiresInSeconds?: number;
}): Promise<string | null> {
  if (process.env.AWS_S3_PRESIGN_ENABLED === "0") {
    return null;
  }
  const region = process.env.AWS_REGION ?? "us-east-1";
  try {
    const client = new S3Client({ region });
    const command = new GetObjectCommand({
      Bucket: params.bucket,
      Key: params.key,
    });
    return await getSignedUrl(client, command, {
      expiresIn: params.expiresInSeconds ?? DEFAULT_EXPIRES,
    });
  } catch {
    return null;
  }
}

export function canAttemptS3Presign(asset: {
  s3Bucket: string | null | undefined;
  s3Key: string | null | undefined;
}): boolean {
  return Boolean(asset.s3Bucket?.trim() && asset.s3Key?.trim());
}
