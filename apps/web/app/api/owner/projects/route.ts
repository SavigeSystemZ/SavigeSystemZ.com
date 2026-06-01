import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { writeAuditLog } from "@/lib/audit";

const createProjectSchema = z.object({
  title: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  summary: z.string().max(500).default(""),
  status: z.enum(["IDEA", "ACTIVE", "PAUSED", "SHIPPED", "ARCHIVED"]).default("IDEA"),
  priority: z.enum(["LOW", "MED", "HIGH"]).default("MED"),
});

export async function GET(request: Request) {
  const auth = await getAuthContext();
  const ownerCheck = requireOwner(auth);
  if (ownerCheck) return ownerCheck;

  const url = new URL(request.url);
  const statusFilter = url.searchParams.get("status");

  const where = statusFilter ? { status: statusFilter as "IDEA" | "ACTIVE" | "PAUSED" | "SHIPPED" | "ARCHIVED" } : {};

  const projects = await db.ownerProject.findMany({
    where,
    orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
    include: {
      _count: {
        select: { notes: true, artifacts: true },
      },
    },
  });

  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const auth = await getAuthContext();
  const ownerCheck = requireOwner(auth);
  if (ownerCheck) return ownerCheck;

  try {
    const json = await request.json();
    const data = createProjectSchema.parse(json);

    const project = await db.ownerProject.create({
      data,
    });

    await writeAuditLog({
      actorUserId: auth.userId,
      action: "owner.project.create",
      targetType: "OwnerProject",
      targetId: project.id,
      metadata: { slug: project.slug },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    // Handle unique constraint failure for slug
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A project with this slug already exists." }, { status: 409 });
    }
    console.error("POST /api/owner/projects error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
