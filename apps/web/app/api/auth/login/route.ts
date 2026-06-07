import { NextResponse } from "next/server";
import { allowAuthRequest } from "@/lib/auth-rate-limit";
import {
  buildSessionCookie,
  createOwnerSession,
  getSessionCookieName,
  getSessionMaxAgeSeconds,
  isValidOwnerAccessCode,
} from "@/lib/auth";
import { db } from "@/lib/db";

const LOGIN_WINDOW_MS = 60_000;
/** Local/E2E hammers login from one IP; keep production tight. */
const LOGIN_MAX_PER_IP = process.env.NODE_ENV === "production" ? 30 : 1000;

export async function POST(request: Request) {
  if (!(await allowAuthRequest(request, "login", LOGIN_MAX_PER_IP, LOGIN_WINDOW_MS))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = (await request.json()) as { accessCode?: string };
  if (!isValidOwnerAccessCode(body.accessCode ?? "")) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const owner = await db.user.upsert({
    where: { email: "owner@savigesystemz.local" },
    update: { role: "OWNER" },
    create: {
      email: "owner@savigesystemz.local",
      name: "Owner",
      role: "OWNER",
    },
  });
  const sessionToken = await createOwnerSession(owner.id);

  const response = NextResponse.json({ ok: true, role: "owner" });
  response.cookies.set({
    name: getSessionCookieName(),
    value: buildSessionCookie(sessionToken),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getSessionMaxAgeSeconds(),
  });
  return response;
}
