import { z } from "zod";
import { db } from "@/lib/db";
import { readJsonBody } from "@/lib/json-body";
import { writeAuditLog } from "@/lib/audit";

const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  subject: z.enum(["Collaboration", "Consulting", "Partnership", "Feedback", "Other"]),
  message: z.string().min(10).max(5000),
});

export async function POST(req: Request) {
  try {
    const body = await readJsonBody(req, 8192);
    const data = contactSchema.parse(body);

    const submission = await db.contactSubmission.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      },
    });

    await writeAuditLog({
      action: "contact.submission.created",
      targetType: "ContactSubmission",
      targetId: submission.id,
      metadata: {
        email: data.email,
        subject: data.subject,
      },
    });

    return Response.json({
      success: true,
      message: "Your message has been received. We'll get back to you soon!",
      id: submission.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          message: "Invalid submission",
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    console.error("[/api/contact] Error:", error);
    return Response.json(
      {
        message: "Failed to process your message. Please try again later.",
      },
      { status: 500 },
    );
  }
}

