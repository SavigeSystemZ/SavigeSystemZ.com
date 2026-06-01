import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SectionHeading } from "@savige/ui";
import { JournalEditor } from "@/components/owner/journal-editor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Daily Journal",
};

export default async function OwnerJournalPage() {
  const auth = await getAuthContext();
  if (auth.role !== "owner") {
    redirect("/owner/login");
  }

  const journals = await db.ownerJournal.findMany({
    orderBy: { date: "desc" },
    take: 30, // Get last 30 entries
  });

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-12 sm:px-6 lg:py-8">
      <SectionHeading
        eyebrow="Private Workspace"
        title="Daily Journal"
        description="Your private log for daily thoughts, planning, and progress tracking."
      />
      <div className="mt-8">
        <JournalEditor journals={journals} />
      </div>
    </main>
  );
}
