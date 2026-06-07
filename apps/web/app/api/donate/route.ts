import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { getRequestClientIp } from "@/lib/client-ip";
import { db } from "@/lib/db";
import { formatUsdFromCents, getDonateConfig } from "@/lib/donate-config";
import { rateLimit } from "@/lib/rate-limit";
import { getStripe } from "@/lib/stripe-client";
import { donateRequestSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const ip = getRequestClientIp(request);
  if (!rateLimit(`donate:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const payload = await request.json();
  const parsed = donateRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", issues: parsed.error.issues }, { status: 400 });
  }

  const application = await db.application.findUnique({ where: { id: parsed.data.applicationId } });
  if (!application || application.visibility !== "PUBLIC") {
    return NextResponse.json({ error: "application_not_found" }, { status: 404 });
  }

  const config = getDonateConfig();
  const origin = new URL(request.url).origin;
  const stripe = getStripe();

  if (!stripe) {
    const sessionId = `dn_mock_${randomUUID().replace(/-/g, "")}`;
    await writeAuditLog({
      action: "donation.checkout.start",
      actorUserId: null,
      targetType: "Application",
      targetId: application.id,
      metadata: {
        mode: "mock",
        sessionId,
        donorEmail: parsed.data.donorEmail ?? null,
        applicationSlug: application.slug,
        sourceIp: ip,
      },
    });
    return NextResponse.json({
      mode: "mock",
      url: `${origin}/api/donate/complete?session_id=${encodeURIComponent(sessionId)}&slug=${encodeURIComponent(application.slug)}`,
    });
  }

  const amountCents = config.defaultAmountCents;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Donation — ${application.name}`,
            description: "Thank you for supporting this SavigeSystemZ project.",
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/api/donate/complete?session_id={CHECKOUT_SESSION_ID}&slug=${encodeURIComponent(application.slug)}`,
    cancel_url: `${origin}/applications/${encodeURIComponent(application.slug)}?donate=canceled`,
    customer_email: parsed.data.donorEmail,
    metadata: {
      applicationId: application.id,
      applicationSlug: application.slug,
      kind: "donation",
    },
  });

  if (!session.id || !session.url) {
    return NextResponse.json({ error: "stripe_session_failed" }, { status: 502 });
  }

  await writeAuditLog({
    action: "donation.checkout.start",
    actorUserId: null,
    targetType: "Application",
    targetId: application.id,
    metadata: {
      mode: "stripe",
      sessionId: session.id,
      amountCents,
      amountLabel: formatUsdFromCents(amountCents),
      donorEmail: parsed.data.donorEmail ?? null,
      applicationSlug: application.slug,
      sourceIp: ip,
    },
  });

  return NextResponse.json({
    mode: "stripe",
    url: session.url,
  });
}
