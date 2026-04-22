import { hmacSha256HexWeb, timingSafeEqualHex } from "@/lib/hmac-web";

export type GithubPushWebhook = {
  repository?: {
    owner?: { login?: string | null } | null;
    name?: string | null;
  } | null;
};

export async function verifyGithubWebhookSignature(params: {
  body: string;
  signatureHeader: string | null;
  secret: string | null | undefined;
}): Promise<boolean> {
  const { body, signatureHeader, secret } = params;
  if (!signatureHeader || !secret) return false;
  const match = signatureHeader.match(/^sha256=([a-f0-9]{64})$/i);
  const digest = match?.[1];
  if (!digest) return false;
  const expected = await hmacSha256HexWeb(secret, body);
  return timingSafeEqualHex(expected, digest.toLowerCase());
}

export function extractGithubPushRef(payload: GithubPushWebhook): { owner: string; repo: string } | null {
  const owner = payload.repository?.owner?.login?.trim();
  const repo = payload.repository?.name?.trim();
  if (!owner || !repo) return null;
  return { owner, repo };
}
