import {
  verifyAuthenticationResponse,
  type AuthenticationResponseJSON,
  type WebAuthnCredential,
} from "@simplewebauthn/server";
import { NextResponse } from "next/server";
import {
  buildSessionCookie,
  createOwnerSession,
  getSessionCookieName,
} from "@/lib/auth";
import { allowAuthRequest } from "@/lib/auth-rate-limit";
import { writeAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { getExpectedOrigin, getRpId, requireUserVerificationStrict } from "@/lib/webauthn-config";

const PASSKEY_WINDOW_MS = 60_000;
const PASSKEY_MAX_PER_IP = 60;

export async function POST(request: Request) {
  if (!(await allowAuthRequest(request, "passkey_login_verify", PASSKEY_MAX_PER_IP, PASSKEY_WINDOW_MS))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = (await request.json()) as {
    challengeId?: string;
    credential?: AuthenticationResponseJSON;
  };

  if (!body.challengeId || !body.credential) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const record = await db.passkeyChallenge.findFirst({
    where: {
      id: body.challengeId,
      kind: "AUTHENTICATION",
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) {
    return NextResponse.json({ error: "challenge_expired_or_missing" }, { status: 400 });
  }

  const passkey = await db.passkeyCredential.findUnique({
    where: { credentialId: body.credential.id },
    include: { user: true },
  });

  if (!passkey || passkey.user.role !== "OWNER") {
    return NextResponse.json({ error: "credential_not_allowed" }, { status: 403 });
  }

  const credential: WebAuthnCredential = {
    id: passkey.credentialId,
    publicKey: Buffer.from(passkey.publicKey, "base64"),
    counter: passkey.counter,
  };

  const expectedOrigin = getExpectedOrigin(request);
  const rpId = getRpId();

  const verification = await verifyAuthenticationResponse({
    response: body.credential,
    expectedChallenge: record.challenge,
    expectedOrigin,
    expectedRPID: rpId,
    credential,
    requireUserVerification: requireUserVerificationStrict(),
  });

  if (!verification.verified) {
    return NextResponse.json({ error: "verification_failed" }, { status: 400 });
  }

  const newCounter = verification.authenticationInfo.newCounter;

  await db.passkeyCredential.update({
    where: { id: passkey.id },
    data: { counter: newCounter },
  });

  await db.passkeyChallenge.delete({ where: { id: record.id } });

  await writeAuditLog({
    actorUserId: passkey.userId,
    action: "passkey.login",
    targetType: "passkey_credential",
    targetId: passkey.id,
  });

  const sessionToken = await createOwnerSession(passkey.userId);

  const response = NextResponse.json({ ok: true, role: "owner" });
  response.cookies.set({
    name: getSessionCookieName(),
    value: buildSessionCookie(sessionToken),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
