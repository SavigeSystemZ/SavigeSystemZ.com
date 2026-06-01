import { buildSecurityHeaders } from "@savige/security";
import { NextResponse, type NextRequest } from "next/server";
import { hmacSha256HexWeb, timingSafeEqualHex } from "@/lib/hmac-web";

async function verifyOwnerSession(token: string | undefined): Promise<boolean> {
  if (!token || !token.includes(".")) return false;
  const [base, sig] = token.split(".");
  const secret = process.env.OWNER_LOGIN_SECRET ?? "change-me-in-production";
  const expected = await hmacSha256HexWeb(secret, base);
  return sig.length === expected.length && timingSafeEqualHex(sig, expected);
}

function productionOwnerSecretIsStrong(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  const secret = process.env.OWNER_LOGIN_SECRET;
  if (!secret || secret.length < 32) return false;
  if (secret === "change-me-in-production") return false;
  return true;
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();

  const headers = buildSecurityHeaders(request);
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/admin") || (pathname.startsWith("/owner") && pathname !== "/owner/login")) {
    if (!productionOwnerSecretIsStrong()) {
      return new NextResponse(
        "Server misconfiguration: set OWNER_LOGIN_SECRET to a unique value of at least 32 characters in production.",
        { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } },
      );
    }
    const session = request.cookies.get("sz_session")?.value;
    if (!(await verifyOwnerSession(session))) {
      return NextResponse.redirect(new URL("/owner/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
