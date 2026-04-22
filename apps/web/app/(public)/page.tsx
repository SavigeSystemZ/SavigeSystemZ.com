import Link from "next/link";
import { SectionHeading } from "@savige/ui";
import { ApplicationMediaGallery } from "@/components/application-media-gallery";
import { ArchiveEntryCard } from "@/components/archive-entry-card";
import { AppShowcaseCard } from "@/components/app-showcase-card";
import { Hero } from "@/components/hero";
import { getPublicArchiveEntries } from "@/lib/archive-resolver";
import { getPublicCatalogWithReleases } from "@/lib/catalog-resolver";
import {
  flagshipMetrics,
  founderSignals,
  foundryLanes,
  projectTracks,
  releaseLanes,
  trustSignals,
} from "@/lib/showcase-content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [appCatalog, archiveEntries] = await Promise.all([
    getPublicCatalogWithReleases(),
    getPublicArchiveEntries(),
  ]);
  const featuredApps = appCatalog.filter((app) => app.featured);
  const featuredArchiveEntries = archiveEntries.filter((entry) => entry.featured);
  const visualRunway = (featuredApps[0] ?? appCatalog[0])?.media ?? [];

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-6 pb-12 sm:px-6 lg:py-8">
      <Hero
        catalogCount={appCatalog.length}
        featuredCount={featuredApps.length}
        archiveCount={archiveEntries.length}
      />

      <section className="reveal grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="surface-panel glow-hover rounded-[2rem] p-6 sm:p-8">
          <SectionHeading
            eyebrow="Operating thesis"
            title="One home for public products, private workflows, and the rest of the engineering stack."
            description="The strongest version of this site is not just a marketing front end. It is a controlled release layer, a systems showcase, a secure owner console, and an engineering archive that can scale with whatever you decide to publish next."
          />
          <div className="reveal-stagger mt-8 grid gap-4 sm:grid-cols-3">
            {flagshipMetrics.map((metric) => (
              <article key={metric.label} className="glow-hover rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5">
                <p className="display-title text-2xl font-semibold tracking-[-0.04em] text-white">{metric.value}</p>
                <p className="mt-2 text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">{metric.label}</p>
                <p className="mt-4 text-sm leading-7 text-slate-300">{metric.detail}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="surface-panel rounded-[2rem] p-6 sm:p-8">
          <p className="section-eyebrow">Launch focus</p>
          <h2 className="display-title mt-4 text-3xl font-semibold tracking-[-0.05em] text-white">
            Current build priorities
          </h2>
          <div className="mt-6 space-y-4">
            {releaseLanes.map((lane, index) => (
              <div key={lane.title} className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-5">
                <p className="text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">Lane 0{index + 1}</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{lane.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{lane.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="reveal surface-panel glow-hover rounded-[2rem] p-6 sm:p-8">
        <SectionHeading
          eyebrow="Flagship catalog"
          title="Applications with stronger narrative, release context, and buyer pathways."
          description="Each catalog entry is treated like a system, not just a project tile. That means positioning, release discipline, and a clear route into detail, delivery, or commissioning work."
          action={
            <Link href="/applications" className="action-secondary text-sm">
              Browse all applications
            </Link>
          }
        />
        <div className="reveal-stagger mt-8 grid gap-4 lg:grid-cols-2">
          {(featuredApps.length > 0 ? featuredApps : appCatalog).map((app) => (
            <AppShowcaseCard key={app.id} app={app} />
          ))}
        </div>
      </section>

      <section className="reveal surface-panel rounded-[2rem] p-6 sm:p-8">
        <SectionHeading
          eyebrow="Visual runway"
          title="The catalog now carries visual identity instead of only text."
          description="Flagship media frames let each application feel like a system with its own command deck, release language, and buyer-facing atmosphere."
        />
        <div className="mt-8">
          <ApplicationMediaGallery items={visualRunway} />
        </div>
      </section>

      <section className="reveal surface-panel glow-hover rounded-[2rem] p-6 sm:p-8">
        <SectionHeading
          eyebrow="Engineering archive"
          title="The rest of the foundry now has a real public surface."
          description="The site is no longer limited to software applications. Archive entries now give Linux builds, config packs, container stacks, research drops, and AI work a first-class showcase lane."
          action={
            <Link href="/archive" className="action-secondary text-sm">
              Open the archive
            </Link>
          }
        />
        <div className="reveal-stagger mt-8 grid gap-4 lg:grid-cols-3">
          {(featuredArchiveEntries.length > 0 ? featuredArchiveEntries : archiveEntries.slice(0, 3)).map((entry) => (
            <ArchiveEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </section>

      <section className="reveal-stagger grid gap-4 xl:grid-cols-3">
        {foundryLanes.map((lane) => (
          <article key={lane.title} className="surface-panel glow-hover rounded-[1.8rem] p-6">
            <p className="section-eyebrow">{lane.title}</p>
            <p className="mt-5 text-sm leading-7 text-slate-300">{lane.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {lane.items.map((item) => (
                <span key={item} className="signal-chip text-xs uppercase tracking-[0.24em] text-slate-200">
                  {item}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="surface-panel rounded-[2rem] p-6 sm:p-8">
          <SectionHeading
            eyebrow="Founder profile"
            title="A site that sells capability by showing the operating standard behind it."
            description="The founder story here is not just resume text. It is systems engineering, automation, security posture, release discipline, and the ability to carry work from concept through delivery."
            action={
              <Link href="/bio" className="action-secondary text-sm">
                Read the bio
              </Link>
            }
          />
          <div className="mt-8 grid gap-4">
            {founderSignals.map((signal) => (
              <article key={signal.title} className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
                <h3 className="text-lg font-semibold text-white">{signal.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{signal.summary}</p>
                <p className="mt-3 text-sm leading-7 text-slate-400">{signal.detail}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="surface-panel rounded-[2rem] p-6 sm:p-8">
            <SectionHeading
              eyebrow="Trust fabric"
              title="Quality signals with moderation instead of empty hype."
              description="The reviews and trust surfaces are positioned around verified delivery, moderation, and auditability so social proof can grow without turning into noise."
              action={
                <Link href="/reviews" className="action-secondary text-sm">
                  Open reviews
                </Link>
              }
            />
            <div className="mt-6 space-y-4">
              {trustSignals.map((signal) => (
                <article key={signal.title} className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-5">
                  <h3 className="text-lg font-semibold text-white">{signal.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{signal.summary}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="surface-panel rounded-[2rem] p-6 sm:p-8">
            <SectionHeading
              eyebrow="Build lane"
              title="Commission product, infrastructure, or environment work directly from the same platform."
              description="Custom engagements can move through discovery, private review, and delivery without leaving the foundry."
              action={
                <Link href="/services" className="action-primary text-xs">
                  Start a request
                </Link>
              }
            />
            <div className="mt-6 grid gap-3">
              {projectTracks.map((track) => (
                <article key={track.name} className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold text-white">{track.name}</h3>
                    <span className="text-xs uppercase tracking-[0.24em] text-cyan-100/70">{track.price}</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{track.summary}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
