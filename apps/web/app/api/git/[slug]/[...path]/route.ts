import { NextResponse } from "next/server";
import { serveGitHttpBackend } from "@/lib/git-http-backend";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/auth";

export const dynamic = "force-dynamic";
// Prevent Next.js from parsing the body as it will corrupt git-receive-pack streams
export const runtime = "nodejs";

const REPOS_PATH = process.env.GIT_REPOS_PATH || "/tmp/savigesystemz-repos";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string; path: string[] }> }) {
  return handleGitRequest(request, params);
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string; path: string[] }> }) {
  return handleGitRequest(request, params);
}

async function handleGitRequest(request: Request, paramsPromise: Promise<{ slug: string; path: string[] }>) {
  const params = await paramsPromise;
  const slug = params.slug;
  const path = params.path.join("/");

  const repo = await db.codeRepository.findUnique({
    where: { slug },
  });

  if (!repo || repo.storageBackend !== "SELF_HOSTED") {
    return new NextResponse("Repository not found", { status: 404 });
  }

  const isPush = path === "git-receive-pack" || request.url.includes("service=git-receive-pack");
  const isPrivate = repo.visibility === "PRIVATE";

  if (isPrivate || isPush) {
    const context = await getAuthContext();
    let isOwner = context.role === "owner";
    let isEntitled = false;

    if (!isOwner) {
      // Check basic auth
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Basic ")) {
        const b64 = authHeader.substring(6);
        const decoded = Buffer.from(b64, "base64").toString("utf8");
        const [, password] = decoded.split(":");
        // For M11 MVP, password must be the OWNER_ACCESS_CODE
        if (password === process.env.OWNER_ACCESS_CODE) {
          isOwner = true;
        }
      }
    }

    if (!isOwner && isPrivate && !isPush && context.userId) {
      // For fetch/clone of PRIVATE repos, check if user has a license to any linked app
      const applications = await db.application.findMany({
        where: { codeRepositoryId: repo.id },
        select: { id: true },
      });
      if (applications.length > 0) {
        const license = await db.license.findFirst({
          where: {
            userId: context.userId,
            applicationId: { in: applications.map((a) => a.id) },
            status: "ACTIVE",
          },
        });
        if (license) {
          isEntitled = true;
        }
      }
    }

    if (!isOwner && !isEntitled) {
      return new NextResponse("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="SavigeSystemZ Git"' },
      });
    }
  }

  return serveGitHttpBackend(request, slug, path, REPOS_PATH);
}
