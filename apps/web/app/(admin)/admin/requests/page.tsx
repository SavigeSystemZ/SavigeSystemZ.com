import type { Metadata } from "next";
import { ProjectRequestsPanel } from "@/components/admin/project-requests-panel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Project requests",
};

export default function ProjectRequestsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Inbound project requests</h1>
      <p className="mt-2 text-zinc-300">
        Submissions from the public Request a Project form. Updates are audited.
      </p>
      <div className="mt-6">
        <ProjectRequestsPanel />
      </div>
    </main>
  );
}
