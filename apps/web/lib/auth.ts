import { cookies } from "next/headers";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export type AuthContext = {
  userId: string | null;
  role: "owner" | "user" | "anonymous";
};

const SESSION_COOKIE = "sz_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function getSessionSecret(): string {
  return process.env.OWNER_LOGIN_SECRET ?? "change-me-in-production";
}

function sign(value: string): string {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

function hashToken(token: string): string {
  return createHmac("sha256", getSessionSecret()).update(token).digest("hex");
}

function decodeSessionToken(token: string | undefined): string | null {
  if (!token || !token.includes(".")) return null;
  const [raw, sig] = token.split(".");
  const expected = sign(raw);
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length) return null;
  const valid = timingSafeEqual(sigBuf, expectedBuf);
  if (!valid) return null;
  return raw;
}

export function buildSessionCookie(token: string): string {
  const sig = sign(token);
  return `${token}.${sig}`;
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE;
}

export function getSessionMaxAgeSeconds(): number {
  return SESSION_TTL_SECONDS;
}

export async function getAuthContext(): Promise<AuthContext> {
  const c = await cookies();
  const rawToken = decodeSessionToken(c.get(SESSION_COOKIE)?.value);
  if (rawToken) {
    const session = await db.session.findUnique({
      where: { tokenHash: hashToken(rawToken) },
      include: { user: true },
    });
    if (session && session.expiresAt.getTime() > Date.now()) {
      return { userId: session.userId, role: session.user.role === "OWNER" ? "owner" : "user" };
    }
  }

  // Never trust client-supplied x-user-* headers (trivially spoofable). Session cookie + DB only.
  return { userId: null, role: "anonymous" };
}

export function requireOwner(context: AuthContext): NextResponse | null {
  if (context.role !== "owner" || !context.userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return null;
}

export function isValidOwnerAccessCode(input: string): boolean {
  const expected = process.env.OWNER_ACCESS_CODE;
  if (!expected) return false;
  const inputBuf = Buffer.from(input);
  const expectedBuf = Buffer.from(expected);
  if (inputBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(inputBuf, expectedBuf);
}

export async function createSessionForUser(userId: string): Promise<string> {
  const rawToken = randomBytes(32).toString("hex");
  await db.session.create({
    data: {
      userId,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + SESSION_TTL_SECONDS * 1000),
    },
  });
  return rawToken;
}

export async function createOwnerSession(userId: string): Promise<string> {
  return createSessionForUser(userId);
}

export async function revokeSessionByCookieValue(cookieValue: string | undefined): Promise<void> {
  const rawToken = decodeSessionToken(cookieValue);
  if (!rawToken) return;
  await db.session.deleteMany({
    where: { tokenHash: hashToken(rawToken) },
  });
}
