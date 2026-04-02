import { NextResponse } from "next/server";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { presignS3GetUrl } from "@/lib/s3-presign";
import { decryptVaultPayload, isVaultDecryptionConfigured } from "@/lib/vault-crypto";
import type { VaultPayloadV1 } from "@/lib/vault-payload";

export async function GET(
  _request: Request,
  props: { params: Promise<{ artifactId: string }> },
): Promise<NextResponse> {
  const auth = await getAuthContext();
  const forbidden = requireOwner(auth);
  if (forbidden) return forbidden;

  const { artifactId } = await props.params;
  const row = await db.vaultArtifact.findFirst({
    where: { id: artifactId, ownerUserId: auth.userId! },
  });

  if (!row) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (!isVaultDecryptionConfigured()) {
    return NextResponse.json({ error: "vault_decryption_required" }, { status: 503 });
  }

  let payload: VaultPayloadV1;
  try {
    const raw = decryptVaultPayload(row.payloadCipher);
    payload = JSON.parse(raw) as VaultPayloadV1;
  } catch {
    return NextResponse.json({ error: "decrypt_failed" }, { status: 500 });
  }

  const bucket = payload.s3Bucket?.trim();
  const key = payload.s3Key?.trim();
  const downloadUrl =
    bucket && key ? await presignS3GetUrl({ bucket, key, expiresInSeconds: 600 }) : null;

  return NextResponse.json({
    ok: true,
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    note: payload.note ?? "",
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    ...(downloadUrl ? { s3DownloadUrl: downloadUrl } : {}),
  });
}
