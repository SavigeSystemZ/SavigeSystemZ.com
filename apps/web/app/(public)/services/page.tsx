import type { Metadata } from "next";
import { Panel, SectionHeading } from "@savige/ui";
import { ProjectRequestForm } from "@/components/project-request-form";
import { projectTracks } from "@/lib/showcase-content";

export const metadata: Metadata = {
  title: "Request a project",
  description: "Submit custom build requests with objectives, timeline, and budget.",
};

export default function ServicesPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-12 sm:px-6 lg:py-8">
      <Panel className="rounded-[2rem] p-6 sm:p-8">
        <SectionHeading
          eyebrow="Project requests"
          title="Bring in product, infrastructure, environment, or operator-system work."
          description="Use this route for custom builds, private tooling, secure delivery systems, local environment engineering, or anything that needs a direct scoped conversation instead of a simple product checkout."
        />
      </Panel>

      <section className="mt-8 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="grid gap-4">
          {projectTracks.map((track) => (
            <article key={track.name} className="surface-panel rounded-[1.8rem] p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="display-title text-2xl font-semibold tracking-[-0.04em] text-white">{track.name}</h2>
                <span className="text-[0.72rem] uppercase tracking-[0.28em] text-cyan-100/70">{track.price}</span>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-300">{track.summary}</p>
              <div className="mt-5 grid gap-3">
                {track.bullets.map((bullet) => (
                  <div key={bullet} className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4 text-sm text-slate-200">
                    {bullet}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="surface-panel rounded-[2rem] p-1 sm:p-2">
          <div className="rounded-[1.7rem] border border-white/8 bg-slate-950/55 p-5 sm:p-6">
            <SectionHeading
              eyebrow="Scope intake"
              title="Send the project through the foundry intake lane."
              description="Provide the objective, constraints, and a useful description of the system you want built. The request is stored for review in the owner console."
            />
            <ProjectRequestForm />
          </div>
        </div>
      </section>
    </main>
  );
}
