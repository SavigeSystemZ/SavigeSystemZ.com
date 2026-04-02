import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { NextResponse } from "next/server";
import { allowAuthRequest } from "@/lib/auth-rate-limit";
import { db } from "@/lib/db";
import { getExpectedOrigin, getRpId, requireUserVerificationStrict } from "@/lib/webauthn-config";

const CHALLENGE_TTL_MS = 120_000;
const PASSKEY_WINDOW_MS = 60_000;
const PASSKEY_MAX_PER_IP = 40;

export async function POST(request: Request) {
  if (!allowAuthRequest(request, "passkey_login_options", PASSKEY_MAX_PER_IP, PASSKEY_WINDOW_MS)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const expectedOrigin = getExpectedOrigin(request);
  await db.passkeyChallenge.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });

  const ownerPasskeys = await db.passkeyCredential.findMany({
    where: { user: { role: "OWNER" } },
    select: { credentialId: true },
  });

  if (ownerPasskeys.length === 0) {
    return NextResponse.json({ error: "no_passkeys_registered" }, { status: 400 });
  }

  const allowCredentials = ownerPasskeys.map((p) => ({
    id: p.credentialId,
  }));

  const options = await generateAuthenticationOptions({
    rpID: getRpId(),
    allowCredentials,
    userVerification: requireUserVerificationStrict() ? "preferred" : "discouraged",
  });

  const record = await db.passkeyChallenge.create({
    data: {
      userId: null,
      kind: "AUTHENTICATION",
      challenge: options.challenge,
      expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS),
    },
  });

  return NextResponse.json({
    challengeId: record.id,
    options,
    rpId: getRpId(),
    expectedOrigin,
    timeout: CHALLENGE_TTL_MS,
  });
}
