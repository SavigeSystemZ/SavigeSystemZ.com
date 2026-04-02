import { securityHeaders } from "@savige/security";
import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

function verifyOwnerSession(token: string | undefined): boolean {
  if (!token || !token.includes(".")) return false;
  const [base, sig] = token.split(".");
  const secret = process.env.OWNER_LOGIN_SECRET ?? "change-me-in-production";
  const expected = createHmac("sha256", secret).update(base).digest("hex");
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length) return false;
  if (!timingSafeEqual(sigBuf, expectedBuf)) return false;
  return base.length > 0;
}

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  if (request.nextUrl.pathname.startsWith("/admin")) {
    const session = request.cookies.get("sz_session")?.value;
    if (!verifyOwnerSession(session)) {
      return NextResponse.redirect(new URL("/owner/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
