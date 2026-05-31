import { NextResponse } from "next/server";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const REPOS_PATH = process.env.GIT_REPOS_PATH || "/tmp/savigesystemz-repos";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getAuthContext();
  const forbidden = requireOwner(context);
  if (forbidden) return forbidden;

  const { id } = await params;

  const repo = await db.codeRepository.findUnique({
    where: { id },
  });

  if (!repo) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Define the target directory: /tmp/savigesystemz-repos/slug.git
  const repoDir = path.join(REPOS_PATH, `${repo.slug}.git`);

  try {
    // Ensure parent dir exists
    await fs.mkdir(REPOS_PATH, { recursive: true });

    // Initialize the bare repo
    await new Promise<void>((resolve, reject) => {
      const child = spawn("git", ["init", "--bare", repoDir]);
      child.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`git init --bare failed with code ${code}`));
      });
      child.on("error", reject);
    });

    // Update the database to SELF_HOSTED
    const updated = await db.codeRepository.update({
      where: { id },
      data: {
        storageBackend: "SELF_HOSTED",
        provider: "LOCAL",
        syncStatus: "OK", // Local repos are considered synced once init'd
      },
    });

    await writeAuditLog({
      actorUserId: context.userId!,
      action: "code.repository.init-local",
      targetType: "CodeRepository",
      targetId: id,
      metadata: { slug: repo.slug, repoDir },
    });

    return NextResponse.json(updated);
  } catch (err: unknown) {
    console.error("Failed to init local repo:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
