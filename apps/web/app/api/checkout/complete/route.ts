import { NextResponse } from "next/server";
import {
  buildSessionCookie,
  createSessionForUser,
  getSessionCookieName,
  getSessionMaxAgeSeconds,
} from "@/lib/auth";
import { completePurchaseFromSessionId } from "@/lib/checkout-complete";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  const origin = new URL(request.url).origin;
  if (!sessionId) {
    return NextResponse.redirect(new URL("/", origin));
  }

  const result = await completePurchaseFromSessionId(sessionId);
  if (!result.ok) {
    return NextResponse.redirect(
      new URL(`/pricing?checkout=error&reason=${result.reason ?? "unknown"}`, origin),
    );
  }

  const response = NextResponse.redirect(new URL("/dashboard?checkout=success", origin));

  if (result.userId) {
    const sessionToken = await createSessionForUser(result.userId);
    response.cookies.set({
      name: getSessionCookieName(),
      value: buildSessionCookie(sessionToken),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: getSessionMaxAgeSeconds(),
    });
  }

  return response;
}
