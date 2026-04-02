import { describe, it, expect, beforeAll, afterEach } from "vitest";
import {
  decryptVaultPayload,
  encryptVaultPayload,
  isVaultDecryptionConfigured,
  isVaultEncryptionConfigured,
} from "@/lib/vault-crypto";

const KEY_A = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const KEY_B = "fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210";

describe("vault-crypto", () => {
  beforeAll(() => {
    process.env.VAULT_ENCRYPTION_KEY = KEY_A;
  });

  afterEach(() => {
    delete process.env.VAULT_ENCRYPTION_KEY_LEGACY;
    process.env.VAULT_ENCRYPTION_KEY = KEY_A;
  });

  it("reports configured when key is valid hex", () => {
    expect(isVaultEncryptionConfigured()).toBe(true);
    expect(isVaultDecryptionConfigured()).toBe(true);
  });

  it("roundtrips JSON payload", () => {
    const plain = JSON.stringify({ note: "hello", tags: ["a", "b"] });
    const enc = encryptVaultPayload(plain);
    expect(decryptVaultPayload(enc)).toBe(plain);
  });

  it("decrypts ciphertext from previous primary using VAULT_ENCRYPTION_KEY_LEGACY", () => {
    process.env.VAULT_ENCRYPTION_KEY = KEY_A;
    const plain = '{"note":"rotated"}';
    const enc = encryptVaultPayload(plain);
    process.env.VAULT_ENCRYPTION_KEY = KEY_B;
    process.env.VAULT_ENCRYPTION_KEY_LEGACY = KEY_A;
    expect(decryptVaultPayload(enc)).toBe(plain);
    expect(isVaultEncryptionConfigured()).toBe(true);
  });
});
