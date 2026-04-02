import { describe, expect, it } from "vitest";
import { createSignedDownloadToken, verifySignedDownloadToken } from "@/lib/signed-download";

describe("signed download tokens", () => {
  it("round-trips and validates expiry", () => {
    const exp = Math.floor(Date.now() / 1000) + 60;
    const token = createSignedDownloadToken({
      assetId: "asset_1",
      exp,
      userId: "user_1",
    });
    const parsed = verifySignedDownloadToken(token);
    expect(parsed?.assetId).toBe("asset_1");
    expect(parsed?.userId).toBe("user_1");
  });

  it("rejects tampered token", () => {
    const exp = Math.floor(Date.now() / 1000) + 60;
    const token = createSignedDownloadToken({
      assetId: "asset_1",
      exp,
      userId: null,
    });
    const bad = `${token}x`;
    expect(verifySignedDownloadToken(bad)).toBeNull();
  });
});
