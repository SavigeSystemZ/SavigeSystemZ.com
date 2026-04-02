import { generateRegistrationOptions } from "@simplewebauthn/server";
import { NextResponse } from "next/server";
import { allowAuthRequest } from "@/lib/auth-rate-limit";
import { getAuthContext } from "@/lib/auth";
import { db } from "@/lib/db";
import { getExpectedOrigin, getRpId, getRpName, requireUserVerificationStrict } from "@/lib/webauthn-config";

const CHALLENGE_TTL_MS = 120_000;
const PASSKEY_WINDOW_MS = 60_000;
const PASSKEY_MAX_PER_IP = 30;

export async function POST(request: Request) {
  if (!allowAuthRequest(request, "passkey_register_options", PASSKEY_MAX_PER_IP, PASSKEY_WINDOW_MS)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const context = await getAuthContext();
  if (context.role !== "owner" || !context.userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  await db.passkeyChallenge.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });

  const user = await db.user.findUnique({
    where: { id: context.userId },
    include: { passkeys: true },
  });
  if (!user) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const excludeCredentials = user.passkeys.map((p) => ({
    id: p.credentialId,
  }));

  const options = await generateRegistrationOptions({
    rpName: getRpName(),
    rpID: getRpId(),
    userName: user.email,
    userDisplayName: user.name ?? user.email,
    userID: new TextEncoder().encode(user.id),
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: requireUserVerificationStrict() ? "preferred" : "discouraged",
    },
    excludeCredentials,
  });

  const record = await db.passkeyChallenge.create({
    data: {
      userId: user.id,
      kind: "REGISTRATION",
      challenge: options.challenge,
      expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS),
    },
  });

  const expectedOrigin = getExpectedOrigin(request);

  return NextResponse.json({
    challengeId: record.id,
    options,
    rpId: getRpId(),
    expectedOrigin,
    timeout: CHALLENGE_TTL_MS,
  });
}
