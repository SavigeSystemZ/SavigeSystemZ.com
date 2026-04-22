import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplicationMediaGallery } from "@/components/application-media-gallery";
import { CheckoutCta } from "@/components/checkout-cta";
import { SectionHeading } from "@/components/section-heading";
import { getPublicApplicationWithReleasesBySlug } from "@/lib/catalog-resolver";
import { getShowcaseApplication } from "@/lib/showcase-content";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const app = await getPublicApplicationWithReleasesBySlug(params.slug);
  if (!app) return { title: "Not found" };
  return {
    title: app.name,
    description: app.summary,
  };
}

export default async function ApplicationDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const app = await getPublicApplicationWithReleasesBySlug(params.slug);
  if (!app) notFound();
  const showcase = getShowcaseApplication(app);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-12 sm:px-6 lg:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: app.name,
            description: app.summary,
            applicationCategory: "DeveloperApplication",
          }),
        }}
      />
      <section className="surface-panel scanline rounded-[2rem] px-6 py-8 sm:px-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="section-eyebrow">{showcase.label}</p>
            <h1 className="display-title mt-5 text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl">
              {app.name}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{showcase.headline}</p>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-400">{showcase.operationalFocus}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {showcase.highlights.map((highlight) => (
                <span key={highlight} className="signal-chip text-xs uppercase tracking-[0.24em] text-slate-200">
                  {highlight}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { label: "Audience", value: showcase.audience },
              { label: "Pricing model", value: showcase.priceModel },
              { label: "Release lane", value: showcase.releaseChannel },
            ].map((item) => (
              <article key={item.label} className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
                <p className="text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">{item.label}</p>
                <p className="mt-3 text-sm leading-7 text-slate-100">{item.value}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-panel rounded-[2rem] p-6 sm:p-8 lg:col-span-2">
          <SectionHeading
            eyebrow="Visual system"
            title="A media runway that makes the product feel like a real operating environment."
            description="Flagship gallery frames let each application carry its own visual identity across detail pages, releases, and public-facing narrative surfaces."
          />
          <div className="mt-8">
            <ApplicationMediaGallery items={app.media} />
          </div>
        </div>

        <div className="surface-panel rounded-[2rem] p-6 sm:p-8">
          <SectionHeading
            eyebrow="System pillars"
            title="What this application is built to do."
            description="The site positions each application around operational fit, release maturity, and delivery structure so buyers understand both the product and the surrounding system."
          />
          <div className="mt-8 grid gap-4">
            {showcase.pillars.map((pillar) => (
              <article key={pillar.title} className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
                <h2 className="text-xl font-semibold text-white">{pillar.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">{pillar.description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="surface-panel rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-title text-3xl font-semibold tracking-[-0.05em] text-white">Purchase lane</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Use the built-in checkout flow for public or mock purchases. Premium deliveries can later route through
              entitled downloads and signed artifacts.
            </p>
            <CheckoutCta applicationId={app.id} />
          </div>

          <div className="surface-panel rounded-[2rem] p-6 sm:p-8">
            <h2 className="display-title text-3xl font-semibold tracking-[-0.05em] text-white">Surface map</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {showcase.surfaces.map((surface) => (
                <span key={surface} className="signal-chip text-xs uppercase tracking-[0.24em] text-slate-200">
                  {surface}
                </span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/downloads" className="action-secondary text-sm">
                View release center
              </Link>
              <Link href="/services" className="action-secondary text-sm">
                Request custom work
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="surface-panel rounded-[2rem] p-6 sm:p-8">
          <SectionHeading
            eyebrow="Release runway"
            title={app.versions.length > 0 ? "Versioned releases are now part of the public story." : "Maturity is framed as a path, not a guess."}
            description={
              app.versions.length > 0
                ? "This application already has public release records attached. Each version can expose changelog context and visible delivery assets."
                : "These stages communicate how the application can evolve from baseline launch into deeper operator or buyer delivery."
            }
          />
          {app.versions.length > 0 ? (
            <div className="mt-8 space-y-4">
              {app.versions.map((version) => (
                <article key={version.id} className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-[0.72rem] uppercase tracking-[0.28em] text-cyan-100/70">Version {version.version}</p>
                      <p className="mt-2 text-sm text-slate-400">
                        {new Date(version.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-300">
                      {version.assets.length} assets
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-300">{version.changelog}</p>
                  {version.assets.length > 0 ? (
                    <div className="mt-5 grid gap-3">
                      {version.assets.map((asset) => (
                        <div
                          key={asset.id}
                          className="rounded-[1.2rem] border border-white/8 bg-slate-950/50 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-white">{asset.fileName}</p>
                              <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">
                                {asset.visibility === "ENTITLED" ? "Entitled asset" : "Public asset"}
                              </p>
                            </div>
                            <a href={`/api/download/${asset.id}?redirect=1`} className="action-secondary text-xs">
                              {asset.visibility === "ENTITLED" ? "Check entitlement" : "Open asset"}
                            </a>
                          </div>
                          {asset.checksum ? (
                            <p className="mt-3 text-xs text-slate-500">{asset.checksum}</p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {showcase.releaseMoments.map((moment) => (
                <article key={moment.stage} className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
                  <p className="text-[0.72rem] uppercase tracking-[0.28em] text-cyan-100/70">{moment.stage}</p>
                  <h2 className="mt-2 text-lg font-semibold text-white">{moment.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{moment.description}</p>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="surface-panel rounded-[2rem] p-6 sm:p-8">
          <SectionHeading
            eyebrow="Build stack"
            title="Delivery is backed by a broader foundry platform."
            description="Applications here are not isolated landing pages. They inherit release handling, owner operations, and private artifact controls from the platform underneath."
          />
          <div className="mt-8 flex flex-wrap gap-2">
            {showcase.stack.map((item) => (
              <span key={item} className="signal-chip text-xs uppercase tracking-[0.24em] text-slate-200">
                {item}
              </span>
            ))}
          </div>
          <p className="mt-6 text-sm leading-7 text-slate-300">
            Summary: {app.summary}
          </p>
        </div>
      </section>

      {app.codeRepository ? (
        <section className="mt-8">
          <div className="surface-panel rounded-[2rem] p-6 sm:p-8">
            <SectionHeading
              eyebrow="Source code"
              title={`${app.codeRepository.name} — open source surface for this application.`}
              description={
                app.codeRepository.description ??
                "Repository metadata is mirrored from GitHub so the application can be evaluated against real code, not just marketing."
              }
            />
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {app.codeRepository.primaryLanguage ? (
                <article className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
                  <p className="text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">Primary language</p>
                  <p className="mt-3 text-sm text-slate-100">{app.codeRepository.primaryLanguage}</p>
                </article>
              ) : null}
              {app.codeRepository.defaultBranch ? (
                <article className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
                  <p className="text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">Default branch</p>
                  <p className="mt-3 text-sm text-slate-100">{app.codeRepository.defaultBranch}</p>
                </article>
              ) : null}
              {typeof app.codeRepository.starCount === "number" ? (
                <article className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
                  <p className="text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">Stars</p>
                  <p className="mt-3 text-sm text-slate-100">{app.codeRepository.starCount}</p>
                </article>
              ) : null}
              {typeof app.codeRepository.openIssueCount === "number" ? (
                <article className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
                  <p className="text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">Open issues</p>
                  <p className="mt-3 text-sm text-slate-100">{app.codeRepository.openIssueCount}</p>
                </article>
              ) : null}
            </div>
            {app.codeRepository.latestCommitMessage ? (
              <p className="mt-6 text-sm text-slate-300">
                <span className="text-slate-400">Latest commit:</span>{" "}
                {app.codeRepository.latestCommitSha ? (
                  <code className="text-slate-200">
                    {app.codeRepository.latestCommitSha.slice(0, 7)}
                  </code>
                ) : null}{" "}
                {app.codeRepository.latestCommitMessage}
              </p>
            ) : null}
            {app.codeRepository.githubUrl ? (
              <div className="mt-6">
                <a
                  href={app.codeRepository.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="action-secondary text-sm"
                >
                  View on GitHub →
                </a>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}
