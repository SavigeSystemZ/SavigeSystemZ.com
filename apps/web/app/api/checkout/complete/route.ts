import { NextResponse } from "next/server";
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

  return NextResponse.redirect(new URL("/dashboard?checkout=success", origin));
}
