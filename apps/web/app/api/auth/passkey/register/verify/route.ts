import { verifyRegistrationResponse, type RegistrationResponseJSON } from "@simplewebauthn/server";
import { NextResponse } from "next/server";
import { allowAuthRequest } from "@/lib/auth-rate-limit";
import { getAuthContext } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { getExpectedOrigin, getRpId, requireUserVerificationStrict } from "@/lib/webauthn-config";

const PASSKEY_WINDOW_MS = 60_000;
const PASSKEY_MAX_PER_IP = 30;

export async function POST(request: Request) {
  if (!(await allowAuthRequest(request, "passkey_register_verify", PASSKEY_MAX_PER_IP, PASSKEY_WINDOW_MS))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const context = await getAuthContext();
  if (context.role !== "owner" || !context.userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as {
    challengeId?: string;
    credential?: RegistrationResponseJSON;
  };

  if (!body.challengeId || !body.credential) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const record = await db.passkeyChallenge.findFirst({
    where: {
      id: body.challengeId,
      userId: context.userId,
      kind: "REGISTRATION",
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) {
    return NextResponse.json({ error: "challenge_expired_or_missing" }, { status: 400 });
  }

  const expectedOrigin = getExpectedOrigin(request);
  const rpId = getRpId();

  const verification = await verifyRegistrationResponse({
    response: body.credential,
    expectedChallenge: record.challenge,
    expectedOrigin,
    expectedRPID: rpId,
    requireUserVerification: requireUserVerificationStrict(),
  });

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: "verification_failed" }, { status: 400 });
  }

  const { credential } = verification.registrationInfo;
  const publicKeyB64 = Buffer.from(credential.publicKey).toString("base64");

  const saved = await db.passkeyCredential.upsert({
    where: { credentialId: credential.id },
    update: {
      publicKey: publicKeyB64,
      counter: credential.counter,
      userId: context.userId,
    },
    create: {
      userId: context.userId,
      credentialId: credential.id,
      publicKey: publicKeyB64,
      counter: credential.counter,
    },
  });

  await db.passkeyChallenge.delete({ where: { id: record.id } });

  await writeAuditLog({
    actorUserId: context.userId,
    action: "passkey.register",
    targetType: "passkey_credential",
    targetId: saved.id,
    metadata: { credentialId: saved.credentialId },
  });

  return NextResponse.json({ ok: true, credentialId: saved.id });
}
