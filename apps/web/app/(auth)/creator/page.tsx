import type { Metadata } from "next";
import Link from "next/link";
import { CreatorSubmissionForm } from "@/components/creator-submission-form";
import { SectionHeading } from "@/components/section-heading";
import { getPublicArchiveEntries } from "@/lib/archive-resolver";
import { getPublicCatalogWithReleases } from "@/lib/catalog-resolver";
import {
  creatorSubmissionTypeDescriptions,
  creatorSubmissionTypeLabels,
  creatorSubmissionTypeOptions,
} from "@/lib/creator-submission-taxonomy";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Creator",
  description: "Submit applications, archive artifacts, research, or system packs into the SavigeSystemZ moderation flow.",
};

async function getCreatorMetrics() {
  try {
    const [total, reviewing, approved] = await Promise.all([
      db.creatorSubmission.count({ where: { deletedAt: null } }),
      db.creatorSubmission.count({ where: { deletedAt: null, status: "REVIEWING" } }),
      db.creatorSubmission.count({ where: { deletedAt: null, status: "APPROVED" } }),
    ]);
    return { total, reviewing, approved };
  } catch {
    return { total: 0, reviewing: 0, approved: 0 };
  }
}

export default async function CreatorPage() {
  const [applications, archiveEntries, metrics] = await Promise.all([
    getPublicCatalogWithReleases(),
    getPublicArchiveEntries(),
    getCreatorMetrics(),
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-12 sm:px-6 lg:py-8">
      <section className="surface-panel rounded-[2rem] p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <p className="section-eyebrow">Creator system</p>
            <h1 className="display-title mt-6 text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl">
              A real intake lane for software, archive work, and controlled releases.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300">
              The creator surface exists so applications, Linux builds, configs, model artifacts, and research drops can
              enter the same world-class shell through review instead of appearing as loose links or unfinished uploads.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#submission-form" className="action-primary">
                Submit an artifact
              </Link>
              <Link href="/archive" className="action-secondary">
                Study archive standards
              </Link>
              <Link href="/applications" className="action-secondary">
                Study app standards
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="surface-panel rounded-[1.6rem] border-white/10 bg-white/[0.03] p-5">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-cyan-100/80">Queue state</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  { value: `${metrics.total}`, label: "active submissions" },
                  { value: `${metrics.reviewing}`, label: "under review" },
                  { value: `${metrics.approved}`, label: "approved" },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-white/8 bg-slate-950/70 p-4">
                    <p className="display-title text-3xl font-semibold tracking-[-0.05em] text-white">
                      {metric.value}
                    </p>
                    <p className="mt-2 text-[0.68rem] uppercase tracking-[0.24em] text-slate-500">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="surface-panel rounded-[1.4rem] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">Public standards</p>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {applications.length} flagship application surfaces and {archiveEntries.length} archive entries already
                  define the bar for framing, release hygiene, and artifact quality.
                </p>
              </div>
              <div className="surface-panel rounded-[1.4rem] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">Review posture</p>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Moderation looks at packaging discipline, public framing, route fit, and whether the artifact belongs
                  in the catalog, archive, or a private delivery channel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 surface-panel rounded-[2rem] p-6 sm:p-8">
        <SectionHeading
          eyebrow="Accepted lanes"
          title="Submit things that deserve a product-grade surface."
          description="This is not a dump folder. The target is work that can hold up as a public launch, controlled archive drop, or private release lane."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {creatorSubmissionTypeOptions.map((type) => (
            <article key={type} className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
                {creatorSubmissionTypeLabels[type]}
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-400">{creatorSubmissionTypeDescriptions[type]}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 xl:grid-cols-3">
        {[
          {
            title: "Stage the artifact",
            copy: "Provide real framing, links, and intent so moderation can route the submission into the right public or private lane.",
          },
          {
            title: "Review and route",
            copy: "Owner review decides whether the submission belongs in the flagship app catalog, archive, or a controlled delivery path.",
          },
          {
            title: "Launch with shape",
            copy: "Approved work can then inherit the release, media, and positioning standards already built into the platform shell.",
          },
        ].map((step) => (
          <article key={step.title} className="surface-panel rounded-[1.6rem] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">{step.title}</p>
            <p className="mt-3 text-sm leading-7 text-slate-400">{step.copy}</p>
          </article>
        ))}
      </section>

      <div id="submission-form" className="mt-8 scroll-mt-28">
        <CreatorSubmissionForm />
      </div>
    </main>
  );
}
