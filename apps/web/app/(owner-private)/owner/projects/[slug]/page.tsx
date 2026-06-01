import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { SectionHeading, Panel, StatusChip } from "@savige/ui";
import { ProjectNotes } from "@/components/owner/project-notes";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const project = await db.ownerProject.findUnique({
    where: { slug: params.slug },
    select: { title: true },
  });
  return {
    title: project?.title ?? "Project Not Found",
  };
}

export default async function OwnerProjectDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const auth = await getAuthContext();
  if (auth.role !== "owner") {
    redirect("/owner/login");
  }

  const project = await db.ownerProject.findUnique({
    where: { slug: params.slug },
    include: {
      notes: { orderBy: { createdAt: "desc" } },
      artifacts: true,
      tags: true,
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-12 sm:px-6 lg:py-8">
      <Panel className="rounded-[2rem] p-6 sm:p-8 border-rose-500/10">
        <div className="flex items-center justify-between mb-4">
          <SectionHeading
            eyebrow={`Project: ${project.slug}`}
            title={project.title}
            description={project.summary || "No summary provided."}
          />
          <div className="flex flex-col items-end gap-2">
            <StatusChip variant={project.status === "ACTIVE" ? "success" : "info"} className="text-xs">
              {project.status}
            </StatusChip>
            <StatusChip variant={project.priority === "HIGH" ? "danger" : project.priority === "MED" ? "warn" : "info"} className="text-[0.62rem]">
              {project.priority} PRIORITY
            </StatusChip>
          </div>
        </div>
      </Panel>

      <ProjectNotes projectId={project.id} initialNotes={project.notes} />
    </main>
  );
}
