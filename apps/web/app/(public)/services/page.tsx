import type { Metadata } from "next";
import { ProjectRequestForm } from "@/components/project-request-form";

export const metadata: Metadata = {
  title: "Request a project",
  description: "Submit custom build requests with objectives, timeline, and budget.",
};

export default function ServicesPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">Request a Project</h1>
      <p className="mt-2 text-zinc-300">Submit custom build requests with objective, timeline, and budget.</p>
      <ProjectRequestForm />
    </main>
  );
}
