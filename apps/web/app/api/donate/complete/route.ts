import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe-client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  const slug = searchParams.get("slug") ?? "";
  const origin = new URL(request.url).origin;

  if (!sessionId) {
    return NextResponse.redirect(new URL("/applications", origin));
  }

  const stripe = getStripe();
  let applicationId: string | null = null;

  if (stripe && sessionId.startsWith("cs_")) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      applicationId = session.metadata?.applicationId ?? null;
    } catch {
      return NextResponse.redirect(new URL(`/applications/${slug}?donate=error`, origin));
    }
  } else if (sessionId.startsWith("dn_mock_")) {
    if (slug) {
      const app = await db.application.findUnique({ where: { slug }, select: { id: true } });
      applicationId = app?.id ?? null;
    }
  }

  if (applicationId) {
    await writeAuditLog({
      action: "donation.checkout.complete",
      actorUserId: null,
      targetType: "Application",
      targetId: applicationId,
      metadata: { sessionId, applicationSlug: slug, mode: stripe ? "stripe" : "mock" },
    });
  }

  const redirectSlug = slug || "applications";
  const target =
    redirectSlug === "applications"
      ? "/applications?donate=thanks"
      : `/applications/${encodeURIComponent(redirectSlug)}?donate=thanks`;

  return NextResponse.redirect(new URL(target, origin));
}
