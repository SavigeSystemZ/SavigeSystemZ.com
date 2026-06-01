import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SectionHeading } from "@savige/ui";
import { ProjectList } from "@/components/owner/project-list";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects",
};

export default async function OwnerProjectsPage() {
  const auth = await getAuthContext();
  if (auth.role !== "owner") {
    redirect("/owner/login");
  }

  const projects = await db.ownerProject.findMany({
    orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
    include: {
      _count: {
        select: { notes: true, artifacts: true },
      },
    },
  });

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-12 sm:px-6 lg:py-8">
      <SectionHeading
        eyebrow="Private Workspace"
        title="Internal Projects & Ideas"
        description="Your private operating catalog for works in progress, scratchpad ideas, and shipped projects."
      />
      <div className="mt-8">
        <ProjectList initialProjects={projects} />
      </div>
    </main>
  );
}
