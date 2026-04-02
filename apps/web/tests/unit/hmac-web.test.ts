import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { hmacSha256HexWeb, timingSafeEqualHex } from "@/lib/hmac-web";

describe("hmacSha256HexWeb", () => {
  it("matches Node.js createHmac for UTF-8 secret and message", async () => {
    const secret = "a".repeat(32);
    const message = "session-token-base";
    const nodeHex = createHmac("sha256", secret).update(message).digest("hex");
    const webHex = await hmacSha256HexWeb(secret, message);
    expect(webHex).toBe(nodeHex);
  });
});

describe("timingSafeEqualHex", () => {
  it("returns true for identical strings", () => {
    expect(timingSafeEqualHex("ab", "ab")).toBe(true);
  });

  it("returns false for different strings of same length", () => {
    expect(timingSafeEqualHex("ab", "ac")).toBe(false);
  });

  it("returns false for different lengths", () => {
    expect(timingSafeEqualHex("a", "ab")).toBe(false);
  });
});
