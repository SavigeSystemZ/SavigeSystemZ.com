import { describe, it, expect, afterEach } from "vitest";
import { vaultJsonByteLengthExceedsLimit, vaultPlaintextMaxBytes } from "@/lib/vault-payload";

describe("vault-payload limits", () => {
  afterEach(() => {
    delete process.env.VAULT_MAX_PLAINTEXT_BYTES;
  });

  it("uses default max bytes", () => {
    expect(vaultPlaintextMaxBytes()).toBe(65536);
  });

  it("respects VAULT_MAX_PLAINTEXT_BYTES", () => {
    process.env.VAULT_MAX_PLAINTEXT_BYTES = "1024";
    expect(vaultPlaintextMaxBytes()).toBe(1024);
  });

  it("detects oversized JSON", () => {
    process.env.VAULT_MAX_PLAINTEXT_BYTES = "512";
    const json = "x".repeat(600);
    expect(vaultJsonByteLengthExceedsLimit(json)).toBe(true);
  });
});
