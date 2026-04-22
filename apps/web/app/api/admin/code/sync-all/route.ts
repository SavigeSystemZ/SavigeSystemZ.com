import { NextResponse } from "next/server";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { listCodeRepositories, syncCodeRepository } from "@/lib/code-repository";

export async function POST() {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const repositories = await listCodeRepositories();
  const results: Array<{ id: string; syncStatus: "OK" | "ERROR"; syncError: string | null }> = [];

  for (const repository of repositories) {
    const updated = await syncCodeRepository(repository.id);
    results.push({
      id: updated.id,
      syncStatus: updated.syncStatus === "ERROR" ? "ERROR" : "OK",
      syncError: updated.syncStatus === "ERROR" ? (updated.syncError ?? "Sync failed") : null,
    });
  }

  await writeAuditLog({
    actorUserId: context.userId,
    action: "code.repository.sync-all",
    targetType: "CodeRepository",
    targetId: null,
    metadata: { repositoryIds: repositories.map((repo) => repo.id), count: repositories.length },
  });

  return NextResponse.json({ results });
}
