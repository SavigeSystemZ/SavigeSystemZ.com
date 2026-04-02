import { NextResponse } from "next/server";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import type { VaultPayloadV1 } from "@/lib/vault-payload";
import { vaultJsonByteLengthExceedsLimit, vaultPlaintextMaxBytes } from "@/lib/vault-payload";
import { getVaultS3Bucket } from "@/lib/s3-vault-presign";
import {
  encryptVaultPayload,
  isVaultDecryptionConfigured,
  isVaultEncryptionConfigured,
  VAULT_STORED_KEY_VERSION,
} from "@/lib/vault-crypto";
import { vaultMutationGate } from "@/lib/vault-rate-limit";
import { vaultPlaceholderSchema } from "@/lib/validation";

export async function GET() {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const items = await db.vaultArtifact.findMany({
    where: { ownerUserId: context.userId! },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, createdAt: true, payloadCipher: true },
  });

  return NextResponse.json({
    ok: true,
    encryption: isVaultEncryptionConfigured() ? "configured" : "missing",
    decryption: isVaultDecryptionConfigured() ? "configured" : "missing",
    s3Vault: getVaultS3Bucket() ? "configured" : "missing",
    items: items.map((row) => ({
      id: row.id,
      createdAt: row.createdAt.toISOString(),
      cipherBytes: row.payloadCipher.length,
    })),
    message: "owner-only vault; list omits decrypted content",
    maxPlaintextBytes: vaultPlaintextMaxBytes(),
  });
}

export async function POST(request: Request) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const rateBlocked = await vaultMutationGate(request);
  if (rateBlocked) return rateBlocked;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = vaultPlaceholderSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", issues: parsed.error.issues }, { status: 400 });
  }

  const { note, tags, s3Bucket, s3Key } = parsed.data;
  const noteLen = note?.length ?? 0;
  const tagCount = tags?.length ?? 0;
  const hasS3 = Boolean(s3Key && s3Bucket);
  const shouldPersist = noteLen > 0 || tagCount > 0 || hasS3;

  if (hasS3) {
    const vaultBucket = getVaultS3Bucket();
    if (!vaultBucket || s3Bucket !== vaultBucket) {
      return NextResponse.json({ error: "invalid_s3_bucket" }, { status: 400 });
    }
    const expectedPrefix = `vault/${context.userId!}/`;
    if (!s3Key!.startsWith(expectedPrefix)) {
      return NextResponse.json({ error: "invalid_s3_key" }, { status: 400 });
    }
  }

  let createdId: string | null = null;
  let persisted = false;

  if (shouldPersist && isVaultEncryptionConfigured()) {
    const payload: VaultPayloadV1 = {
      note: note ?? "",
      tags: tags ?? [],
      ...(hasS3 ? { s3Bucket: s3Bucket!, s3Key: s3Key! } : {}),
    };
    const payloadJson = JSON.stringify(payload);
    if (vaultJsonByteLengthExceedsLimit(payloadJson)) {
      return NextResponse.json(
        {
          error: "payload_too_large",
          maxBytes: vaultPlaintextMaxBytes(),
        },
        { status: 413 },
      );
    }
    const payloadCipher = encryptVaultPayload(payloadJson);
    const created = await db.vaultArtifact.create({
      data: {
        ownerUserId: context.userId!,
        payloadCipher,
        keyVersion: VAULT_STORED_KEY_VERSION,
      },
    });
    createdId = created.id;
    persisted = true;
  }

  await writeAuditLog({
    actorUserId: context.userId,
    action: "vault.placeholder.submit",
    targetType: "vault",
    targetId: createdId,
    metadata: {
      noteLength: noteLen,
      tagCount,
      persisted,
      hasS3,
    },
  });

  return NextResponse.json({
    ok: true,
    accepted: true,
    persisted,
    artifactId: createdId,
    warning:
      shouldPersist && !persisted
        ? "Set VAULT_ENCRYPTION_KEY (64 hex chars) to persist encrypted rows."
        : undefined,
  });
}
