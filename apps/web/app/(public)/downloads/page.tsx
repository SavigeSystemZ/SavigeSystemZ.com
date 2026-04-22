import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@savige/ui";
import { getPublicCatalogWithReleases } from "@/lib/catalog-resolver";
import { getShowcaseApplication, releaseLanes } from "@/lib/showcase-content";

export const metadata: Metadata = {
  title: "Downloads",
  description: "Versioned releases, checksums, and secure download flows.",
};

export const dynamic = "force-dynamic";

export default async function DownloadsPage() {
  const appCatalog = await getPublicCatalogWithReleases();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-12 sm:px-6 lg:py-8">
      <section className="surface-panel rounded-[2rem] p-6 sm:p-8">
        <SectionHeading
          eyebrow="Downloads"
          title="Release lanes built for binaries, kits, premium drops, and private artifacts."
          description="This is where catalog entries turn into deliverables: public packages, entitled purchases, and controlled private assets with traceable access."
          action={
            <Link href="/applications" className="action-secondary text-sm">
              Back to applications
            </Link>
          }
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {releaseLanes.map((lane) => (
            <article key={lane.title} className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5">
              <h2 className="text-xl font-semibold text-white">{lane.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{lane.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {lane.items.map((item) => (
                  <span key={item} className="signal-chip text-xs uppercase tracking-[0.24em] text-slate-200">
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {appCatalog.map((app) => {
          const showcase = getShowcaseApplication(app);
          const latestVersion = app.versions[0];
          const visibleAssetCount = app.versions.reduce((count, version) => count + version.assets.length, 0);
          const preview = app.media[0] ?? null;

          return (
            <article key={app.id} className="surface-panel rounded-[1.8rem] p-6">
              {preview ? (
                <div className="relative min-h-[13rem] overflow-hidden rounded-[1.5rem] border border-white/8 bg-slate-950/70">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${preview.thumbnailUrl ?? preview.mediaUrl})` }}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.86)_84%)]" />
                  <div className="relative flex min-h-[13rem] items-end p-4">
                    <div>
                      <p className="text-[0.68rem] uppercase tracking-[0.26em] text-cyan-100/70">Release visual</p>
                      <p className="mt-2 text-sm font-medium text-white">{preview.title}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className={`flex items-center justify-between gap-4 ${preview ? "mt-5" : ""}`}>
                <h2 className="display-title text-2xl font-semibold tracking-[-0.04em] text-white">{app.name}</h2>
                <span className="text-[0.72rem] uppercase tracking-[0.28em] text-cyan-100/70">
                  {showcase.releaseChannel}
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-300">{app.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {showcase.surfaces.map((surface) => (
                  <span key={surface} className="signal-chip text-xs uppercase tracking-[0.24em] text-slate-200">
                    {surface}
                  </span>
                ))}
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">Latest version</p>
                  <p className="mt-3 text-sm text-slate-100">{latestVersion ? latestVersion.version : "Not published yet"}</p>
                </div>
                <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">Visible assets</p>
                  <p className="mt-3 text-sm text-slate-100">{visibleAssetCount}</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/applications/${app.slug}`} className="action-secondary text-sm">
                  Open detail page
                </Link>
                <Link href="/pricing" className="action-secondary text-sm">
                  Review pricing
                </Link>
              </div>
              {latestVersion ? (
                <div className="mt-6 rounded-[1.4rem] border border-white/8 bg-slate-950/50 p-4">
                  <p className="text-sm font-semibold text-white">
                    {latestVersion.version} release
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{latestVersion.changelog}</p>
                  {latestVersion.assets.length > 0 ? (
                    <div className="mt-4 grid gap-3">
                      {latestVersion.assets.map((asset) => (
                        <div key={asset.id} className="rounded-[1.1rem] border border-white/8 bg-white/[0.03] p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-white">{asset.fileName}</p>
                              <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">
                                {asset.visibility === "ENTITLED" ? "Entitled" : "Public"}
                              </p>
                            </div>
                            <a href={`/api/download/${asset.id}?redirect=1`} className="action-secondary text-xs">
                              {asset.visibility === "ENTITLED" ? "Access asset" : "Download"}
                            </a>
                          </div>
                          {asset.checksum ? <p className="mt-3 text-xs text-slate-500">{asset.checksum}</p> : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-400">No visible assets published for this version yet.</p>
                  )}
                </div>
              ) : (
                <div className="mt-6 rounded-[1.4rem] border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-slate-400">
                  Release records have not been published for this application yet.
                </div>
              )}
            </article>
          );
        })}
      </section>

      <section className="mt-8 surface-panel rounded-[2rem] p-6 sm:p-8">
        <SectionHeading
          eyebrow="Secure delivery model"
          title="Purchase, sign, audit, and deliver instead of emailing files around."
          description="The site’s delivery architecture is structured for checkout completion, entitlement awareness, short-lived signed access, and visibility into what was downloaded and when."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          {[
            "Catalog entry or pricing surface",
            "Checkout or entitlement decision",
            "Signed file access",
            "Audit and download history",
          ].map((step, index) => (
            <article key={step} className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
              <p className="text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">Step 0{index + 1}</p>
              <p className="mt-3 text-sm leading-7 text-slate-100">{step}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
