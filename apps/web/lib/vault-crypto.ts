import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const AUTH_TAG_LEN = 16;
const KEY_BYTES = 32;

/**
 * Stored on `VaultArtifact.keyVersion`. Bump only when ciphertext format or
 * key policy meaningfully changes (and teach decrypt paths accordingly).
 */
export const VAULT_STORED_KEY_VERSION = 1;

function parseHexKey(envName: "VAULT_ENCRYPTION_KEY" | "VAULT_ENCRYPTION_KEY_LEGACY"): Buffer | null {
  const hex = process.env[envName]?.trim();
  if (!hex || !/^[0-9a-fA-F]{64}$/.test(hex)) return null;
  const key = Buffer.from(hex, "hex");
  return key.length === KEY_BYTES ? key : null;
}

/** Keys tried in order for decrypt: primary, then optional legacy (rotation). */
function getDecryptKeyBuffers(): Buffer[] {
  const keys: Buffer[] = [];
  const primary = parseHexKey("VAULT_ENCRYPTION_KEY");
  if (primary) keys.push(primary);
  const legacy = parseHexKey("VAULT_ENCRYPTION_KEY_LEGACY");
  if (legacy) keys.push(legacy);
  const seen = new Set<string>();
  return keys.filter((k) => {
    const s = k.toString("hex");
    if (seen.has(s)) return false;
    seen.add(s);
    return true;
  });
}

function getPrimaryKeyBuffer(): Buffer {
  const key = parseHexKey("VAULT_ENCRYPTION_KEY");
  if (!key) {
    throw new Error("VAULT_ENCRYPTION_KEY must be 64 hexadecimal characters (32 bytes)");
  }
  return key;
}

/**
 * Primary key present — required for new encrypted rows.
 */
export function isVaultEncryptionConfigured(): boolean {
  return Boolean(parseHexKey("VAULT_ENCRYPTION_KEY"));
}

/**
 * At least one key available for decrypt (primary and/or legacy).
 */
export function isVaultDecryptionConfigured(): boolean {
  return getDecryptKeyBuffers().length > 0;
}

/** Encrypt UTF-8 plaintext; returns base64(iv || tag || ciphertext). Always uses primary key. */
export function encryptVaultPayload(plainText: string): string {
  const key = getPrimaryKeyBuffer();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

/** Decrypt payload; tries primary key first, then `VAULT_ENCRYPTION_KEY_LEGACY` if set. */
export function decryptVaultPayload(b64: string): string {
  const keys = getDecryptKeyBuffers();
  if (keys.length === 0) {
    throw new Error("no vault decryption keys configured");
  }
  const buf = Buffer.from(b64, "base64");
  if (buf.length < IV_LEN + AUTH_TAG_LEN + 1) {
    throw new Error("invalid vault payload");
  }
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + AUTH_TAG_LEN);
  const data = buf.subarray(IV_LEN + AUTH_TAG_LEN);
  let lastErr: Error | null = null;
  for (const key of keys) {
    try {
      const decipher = createDecipheriv(ALGO, key, iv);
      decipher.setAuthTag(tag);
      return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
    }
  }
  throw lastErr ?? new Error("decrypt failed");
}
