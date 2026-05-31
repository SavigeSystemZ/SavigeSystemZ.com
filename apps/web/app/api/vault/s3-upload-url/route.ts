import { NextResponse } from "next/server";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { presignVaultPutUrl } from "@/lib/s3-vault-presign";
import { vaultMutationGate } from "@/lib/vault-rate-limit";

/**
 * Owner-only presigned PUT for a vault-scoped object key under `vault/{userId}/…`.
 */
export async function POST(request: Request) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const rateBlocked = await vaultMutationGate(request, context.userId);
  if (rateBlocked) return rateBlocked;

  const result = await presignVaultPutUrl(context.userId!);
  if (!result) {
    return NextResponse.json(
      { error: "s3_vault_not_configured", message: "Set AWS_S3_VAULT_BUCKET and AWS credentials; ensure AWS_S3_PRESIGN_ENABLED is not 0." },
      { status: 501 },
    );
  }

  return NextResponse.json({
    ok: true,
    uploadUrl: result.uploadUrl,
    bucket: result.bucket,
    key: result.key,
    expiresInSeconds: result.expiresInSeconds,
    method: "PUT" as const,
  });
}
