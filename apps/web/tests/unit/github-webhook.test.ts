import { describe, expect, it } from "vitest";
import { hmacSha256HexWeb } from "@/lib/hmac-web";
import { extractGithubPushRef, verifyGithubWebhookSignature } from "@/lib/github-webhook";

describe("github webhook helpers", () => {
  it("accepts a valid sha256 signature", async () => {
    const body = JSON.stringify({ repository: { owner: { login: "octocat" }, name: "hello-world" } });
    const digest = await hmacSha256HexWeb("secret", body);
    const ok = await verifyGithubWebhookSignature({
      body,
      signatureHeader: `sha256=${digest}`,
      secret: "secret",
    });
    expect(ok).toBe(true);
  });

  it("rejects missing or malformed signatures", async () => {
    const body = "{}";
    await expect(
      verifyGithubWebhookSignature({ body, signatureHeader: null, secret: "secret" }),
    ).resolves.toBe(false);
    await expect(
      verifyGithubWebhookSignature({ body, signatureHeader: "sha1=abc", secret: "secret" }),
    ).resolves.toBe(false);
    await expect(
      verifyGithubWebhookSignature({ body, signatureHeader: "sha256=abc", secret: "secret" }),
    ).resolves.toBe(false);
  });

  it("extracts owner/repo for push payloads", () => {
    expect(
      extractGithubPushRef({ repository: { owner: { login: "octocat" }, name: "hello-world" } }),
    ).toEqual({ owner: "octocat", repo: "hello-world" });
    expect(extractGithubPushRef({ repository: { owner: { login: "" }, name: "hello-world" } })).toBeNull();
  });
});
