import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionCookieName, revokeSessionByCookieValue } from "@/lib/auth";

export async function POST() {
  const c = await cookies();
  await revokeSessionByCookieValue(c.get(getSessionCookieName())?.value);
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: getSessionCookieName(),
    value: "",
    maxAge: 0,
    path: "/",
  });
  return response;
}
