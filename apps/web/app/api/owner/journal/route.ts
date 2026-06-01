import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext, requireOwner } from "@/lib/auth";
import { z } from "zod";

const journalSchema = z.object({
  date: z.string().datetime(),
  bodyMarkdown: z.string(),
});

export async function POST(request: Request) {
  const auth = await getAuthContext();
  const ownerCheck = requireOwner(auth);
  if (ownerCheck) return ownerCheck;

  try {
    const json = await request.json();
    const { date, bodyMarkdown } = journalSchema.parse(json);
    const parsedDate = new Date(date);

    // Normalize date to UTC midnight for the unique constraint
    const normalizedDate = new Date(Date.UTC(parsedDate.getUTCFullYear(), parsedDate.getUTCMonth(), parsedDate.getUTCDate()));

    const journal = await db.ownerJournal.upsert({
      where: { date: normalizedDate },
      update: { bodyMarkdown },
      create: { date: normalizedDate, bodyMarkdown },
    });

    return NextResponse.json(journal, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("POST /api/owner/journal error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
