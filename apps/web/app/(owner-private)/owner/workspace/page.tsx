import type { Metadata } from "next";
import Link from "next/link";
import { Panel, SectionHeading, StatusChip } from "@savige/ui";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function OwnerWorkspacePage() {
  const auth = await getAuthContext();
  if (auth.role !== "owner") {
    redirect("/owner/login");
  }

  // Fetch some summary data for the dashboard
  const activeProjects = await db.ownerProject.findMany({
    where: { status: { in: ["IDEA", "ACTIVE", "PAUSED"] } },
    orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
    take: 6,
  });

  const pinnedNotes = await db.ownerNote.findMany({
    where: { pinned: true },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  const recentJournals = await db.ownerJournal.findMany({
    orderBy: { date: "desc" },
    take: 3,
  });

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-12 sm:px-6 lg:py-8">
      <Panel className="rounded-[2rem] p-6 sm:p-8 border-rose-500/10">
        <SectionHeading
          eyebrow="Private Workspace"
          title="Owner Command & Idea Vault"
          description="A hermetically sealed zone for internal projects, notes, file staging, and daily logs. Not accessible to public or standard users."
        />
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href="/owner/projects" className="action-primary text-sm shadow-rose-500/20 bg-rose-600 hover:bg-rose-500 text-white border-rose-400">
            View all projects
          </Link>
          <Link href="/owner/journal" className="action-secondary text-sm">
            Daily journal
          </Link>
        </div>
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400 mb-4">Active Projects</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {activeProjects.length > 0 ? (
                activeProjects.map((project) => (
                  <Panel key={project.id} className="p-5 rounded-2xl flex flex-col h-full">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-white truncate">{project.title}</h3>
                      <StatusChip variant={project.status === "ACTIVE" ? "success" : "info"} className="text-[0.62rem]">
                        {project.status}
                      </StatusChip>
                    </div>
                    <p className="text-sm text-slate-300 line-clamp-3 mb-4 flex-1">
                      {project.summary}
                    </p>
                    <Link href={`/owner/projects/${project.slug}`} className="text-xs text-rose-300 hover:text-rose-200 mt-auto uppercase tracking-widest font-medium">
                      Open Project →
                    </Link>
                  </Panel>
                ))
              ) : (
                <Panel className="p-5 rounded-2xl sm:col-span-2 border-dashed border-white/10 bg-transparent text-center py-12">
                  <p className="text-sm text-slate-400">No active projects or ideas.</p>
                </Panel>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400 mb-4">Recent Journals</h2>
            <div className="space-y-3">
              {recentJournals.length > 0 ? (
                recentJournals.map((journal) => (
                  <Panel key={journal.id} className="p-4 rounded-xl">
                    <h3 className="text-xs font-semibold text-rose-200 uppercase tracking-widest mb-2">
                      {new Date(journal.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h3>
                    <p className="text-sm text-slate-300 line-clamp-2">
                      {journal.bodyMarkdown}
                    </p>
                  </Panel>
                ))
              ) : (
                <Panel className="p-5 rounded-xl border-dashed border-white/10 bg-transparent text-center">
                  <p className="text-sm text-slate-400">No journal entries yet.</p>
                </Panel>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400 mb-4">Pinned Notes</h2>
            <div className="space-y-3">
              {pinnedNotes.length > 0 ? (
                pinnedNotes.map((note) => (
                  <Panel key={note.id} className="p-4 rounded-xl border-l-2 border-l-rose-500">
                    <h3 className="font-semibold text-white text-sm mb-1">{note.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{note.bodyMarkdown}</p>
                  </Panel>
                ))
              ) : (
                <Panel className="p-5 rounded-xl border-dashed border-white/10 bg-transparent text-center">
                  <p className="text-sm text-slate-400">No pinned notes.</p>
                </Panel>
              )}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
