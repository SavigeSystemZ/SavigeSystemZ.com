import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@savige/ui";
import { founderSignals, foundryLanes } from "@/lib/showcase-content";

export const metadata: Metadata = {
  title: "Bio",
  description: "Founder profile, capability depth, and technical background.",
};

export default function BioPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-12 sm:px-6 lg:py-8">
      <section className="surface-panel rounded-[2rem] p-6 sm:p-8">
        <SectionHeading
          eyebrow="Founder profile"
          title="Michael Spaulding (Sys Sav)"
          description="Builder of security-forward software systems, release platforms, local environment tooling, and operator-grade product experiences. The point of this site is to make that range visible in one coherent surface instead of scattering it across unrelated repos and profiles."
          action={
            <Link href="/services" className="action-secondary text-sm">
              Work together
            </Link>
          }
        />
      </section>

      <section className="mt-8 grid gap-4 xl:grid-cols-3">
        {founderSignals.map((signal) => (
          <article key={signal.title} className="surface-panel rounded-[1.8rem] p-6">
            <h2 className="display-title text-2xl font-semibold tracking-[-0.04em] text-white">{signal.title}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">{signal.summary}</p>
            <p className="mt-4 text-sm leading-7 text-slate-400">{signal.detail}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="surface-panel rounded-[2rem] p-6 sm:p-8">
          <SectionHeading
            eyebrow="What lives here"
            title="The portfolio is broader than applications alone."
            description="The showcase is designed to hold product releases, internal tools, Linux work, config systems, automation, containers, and AI experiments because that is how the actual engineering work is shaped."
          />
          <div className="mt-8 grid gap-4">
            {foundryLanes.map((lane) => (
              <div key={lane.title} className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
                <h3 className="text-lg font-semibold text-white">{lane.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{lane.summary}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="surface-panel rounded-[2rem] p-6 sm:p-8">
          <SectionHeading
            eyebrow="Operating style"
            title="Security, release control, and clarity over noise."
            description="This platform reflects how the work is approached: real delivery surfaces, explicit control boundaries, and a willingness to make the surrounding system as strong as the feature set."
          />
          <div className="mt-8 flex flex-wrap gap-2">
            {[
              "Zero-trust admin",
              "Audit logging",
              "Release discipline",
              "Environment engineering",
              "AI workflows",
              "Systems-first thinking",
            ].map((item) => (
              <span key={item} className="signal-chip text-xs uppercase tracking-[0.24em] text-slate-200">
                {item}
              </span>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
