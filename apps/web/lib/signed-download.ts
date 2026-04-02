import { createHmac, timingSafeEqual } from "node:crypto";

function signingSecret(): string {
  return process.env.DOWNLOAD_SIGNING_SECRET ?? process.env.OWNER_LOGIN_SECRET ?? "change-me-in-production";
}

export type SignedDownloadPayload = {
  assetId: string;
  exp: number;
  userId: string | null;
};

function encodePayload(payload: SignedDownloadPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function signPayload(encoded: string): string {
  return createHmac("sha256", signingSecret()).update(encoded).digest("hex");
}

export function createSignedDownloadToken(payload: SignedDownloadPayload): string {
  const encoded = encodePayload(payload);
  const sig = signPayload(encoded);
  return `${encoded}.${sig}`;
}

export function verifySignedDownloadToken(token: string | undefined): SignedDownloadPayload | null {
  if (!token || !token.includes(".")) return null;
  const [encoded, sig] = token.split(".");
  const expected = signPayload(encoded);
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expectedBuf)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SignedDownloadPayload;
    if (!parsed.assetId || typeof parsed.exp !== "number") return null;
    if (parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}
