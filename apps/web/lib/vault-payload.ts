/**
 * Plaintext JSON shape stored encrypted in `VaultArtifact.payloadCipher`.
 */
export type VaultPayloadV1 = {
  note: string;
  tags: string[];
  s3Bucket?: string;
  s3Key?: string;
};

/** Max UTF-8 byte length of JSON before encryption (default 64 KiB, cap 1 MiB). */
export function vaultPlaintextMaxBytes(): number {
  const n = Number(process.env.VAULT_MAX_PLAINTEXT_BYTES ?? "65536");
  if (!Number.isFinite(n) || n < 512) return 65536;
  return Math.min(Math.floor(n), 1_048_576);
}

export function vaultJsonByteLengthExceedsLimit(json: string): boolean {
  return Buffer.byteLength(json, "utf8") > vaultPlaintextMaxBytes();
}
