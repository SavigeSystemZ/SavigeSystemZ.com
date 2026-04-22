import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { getRequestClientIp } from "@/lib/client-ip";
import { syncCodeRepositoryByGithubRef } from "@/lib/code-repository";
import { extractGithubPushRef, verifyGithubWebhookSignature } from "@/lib/github-webhook";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getRequestClientIp(request);
  if (!rateLimit(`webhook:github:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const event = request.headers.get("x-github-event") ?? "";
  const signatureHeader = request.headers.get("x-hub-signature-256");
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  const body = await request.text();
  const valid = await verifyGithubWebhookSignature({ body, signatureHeader, secret });
  if (!valid) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  if (event !== "push") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const ref = extractGithubPushRef(payload as { repository?: { owner?: { login?: string }; name?: string } });
  if (!ref) {
    return NextResponse.json({ error: "missing_repository_ref" }, { status: 400 });
  }

  try {
    const updated = await syncCodeRepositoryByGithubRef(ref.owner, ref.repo);
    await writeAuditLog({
      action: "code.repository.webhook",
      actorUserId: null,
      targetType: "CodeRepository",
      targetId: updated.id,
      metadata: {
        event,
        sourceIp: ip,
        syncStatus: updated.syncStatus,
        githubOwner: ref.owner,
        githubRepo: ref.repo,
      },
    });
    return NextResponse.json({ ok: true, id: updated.id, syncStatus: updated.syncStatus });
  } catch (error) {
    const message = error instanceof Error ? error.message : "sync_failed";
    if (/not tracked/i.test(message)) {
      return NextResponse.json({ ok: true, ignored: true });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
