import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/section-heading";
import { getPublicArchiveEntryBySlug } from "@/lib/archive-resolver";
import { archiveCategoryThemes } from "@/lib/archive-taxonomy";

export const dynamic = "force-dynamic";

function isExternalUrl(value: string): boolean {
  return /^https?:\/\//.test(value);
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const entry = await getPublicArchiveEntryBySlug(params.slug);
  if (!entry) return { title: "Not found" };

  return {
    title: entry.title,
    description: entry.summary,
  };
}

export default async function ArchiveDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const entry = await getPublicArchiveEntryBySlug(params.slug);
  if (!entry) notFound();

  const theme = archiveCategoryThemes[entry.category];
  const actionHref = entry.artifactUrl ?? "/services";
  const actionLabel = entry.artifactLabel ?? "Request access";
  const publishedDate = new Date(entry.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-12 sm:px-6 lg:py-8">
      <section className="surface-panel scanline rounded-[2rem] px-6 py-8 sm:px-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="flex flex-wrap gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-slate-200/80">
              <span className="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-1 text-cyan-100">
                {entry.categoryLabel}
              </span>
              {entry.featured ? (
                <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-amber-100">
                  Featured archive
                </span>
              ) : null}
            </div>
            <h1 className="display-title mt-5 text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl">
              {entry.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{entry.summary}</p>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-400">
              {entry.details ?? "This archive entry is part of the broader SavigeSystemZ foundry output and can evolve into public delivery, private handoff, or a deeper commissioned system."}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {entry.tags.map((tag) => (
                <span key={tag} className="signal-chip text-xs uppercase tracking-[0.24em] text-slate-200">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className={`relative min-h-[24rem] overflow-hidden rounded-[1.9rem] border border-white/10 ${theme}`}>
            {entry.previewImageUrl ? (
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${entry.previewImageUrl})` }}
              />
            ) : null}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.9)_84%)]" />
            <div className="relative flex min-h-[24rem] flex-col justify-between p-6 sm:p-7">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Stage", value: entry.stageLabel ?? "Foundry archive" },
                  { label: "Format", value: entry.artifactFormat ?? "Structured archive lane" },
                  { label: "Published", value: publishedDate },
                  { label: "Visibility", value: entry.visibility.toUpperCase() },
                ].map((item) => (
                  <article key={item.label} className="rounded-[1.3rem] border border-white/10 bg-slate-950/45 p-4">
                    <p className="text-[0.68rem] uppercase tracking-[0.26em] text-slate-400">{item.label}</p>
                    <p className="mt-2 text-sm leading-6 text-white">{item.value}</p>
                  </article>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href={actionHref}
                  className="action-primary text-sm"
                  target={isExternalUrl(actionHref) ? "_blank" : undefined}
                  rel={isExternalUrl(actionHref) ? "noreferrer" : undefined}
                >
                  {actionLabel}
                </a>
                <Link href="/archive" className="action-secondary text-sm">
                  Back to archive
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="surface-panel rounded-[2rem] p-6 sm:p-8">
          <SectionHeading
            eyebrow="Archive posture"
            title="This entry is framed like a real lane of work, not a loose artifact."
            description="The strongest version of the archive gives every drop enough context to explain why it exists, who it serves, and how it relates to the rest of the foundry."
          />
          <div className="mt-8 grid gap-4">
            {[
              {
                title: "Operational framing",
                description:
                  entry.details ?? "Public archive entries should explain the system around the artifact, not just list file names.",
              },
              {
                title: "Delivery readiness",
                description:
                  entry.artifactFormat
                    ? `The delivery posture is currently framed as ${entry.artifactFormat}.`
                    : "This lane can later route through direct delivery, entitlements, or private handoff.",
              },
              {
                title: "Platform fit",
                description:
                  "Archive content here is meant to sit beside applications, releases, vault material, and owner controls without feeling like a separate disconnected site.",
              },
            ].map((pillar) => (
              <article key={pillar.title} className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
                <h2 className="text-xl font-semibold text-white">{pillar.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">{pillar.description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="surface-panel rounded-[2rem] p-6 sm:p-8">
            <SectionHeading
              eyebrow="Stack trace"
              title="Core materials attached to this archive lane."
              description="These tags and stack items make the entry legible to technical readers without forcing them to reverse-engineer what the work actually contains."
            />
            <div className="mt-6 flex flex-wrap gap-2">
              {entry.stackItems.map((item) => (
                <span key={item} className="signal-chip text-xs uppercase tracking-[0.24em] text-slate-200">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="surface-panel rounded-[2rem] p-6 sm:p-8">
            <SectionHeading
              eyebrow="Next route"
              title="Move from showcase into delivery or collaboration."
              description="Archive entries can remain public showcase pieces, convert into release-driven artifacts, or become private scoped work."
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={actionHref}
                className="action-primary text-sm"
                target={isExternalUrl(actionHref) ? "_blank" : undefined}
                rel={isExternalUrl(actionHref) ? "noreferrer" : undefined}
              >
                {actionLabel}
              </a>
              <Link href="/downloads" className="action-secondary text-sm">
                Visit downloads
              </Link>
              <Link href="/services" className="action-secondary text-sm">
                Request custom work
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
