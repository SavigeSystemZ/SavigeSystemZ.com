import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { z } from "zod";

const noteSchema = z.object({
  title: z.string().min(1).max(100),
  bodyMarkdown: z.string(),
  pinned: z.boolean().default(false),
});

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const auth = await getAuthContext();
  const ownerCheck = requireOwner(auth);
  if (ownerCheck) return ownerCheck;

  try {
    const json = await request.json();
    const data = noteSchema.parse(json);

    // Verify project exists
    const project = await db.ownerProject.findUnique({ where: { id: params.id } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const note = await db.ownerNote.create({
      data: {
        ...data,
        projectId: params.id,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("POST /api/owner/projects/[id]/notes error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
