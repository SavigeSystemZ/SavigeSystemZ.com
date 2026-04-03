import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { getAuthContext } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Licensed applications, release delivery routes, and access controls for SavigeSystemZ purchases.",
};

type DashboardPageProps = {
  searchParams: Promise<{
    checkout?: string;
  }>;
};

async function getLicensedDashboardData(userId: string) {
  const [user, licenses, downloadCount] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    }),
    db.license.findMany({
      where: { userId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      include: {
        application: {
          include: {
            versions: {
              orderBy: { createdAt: "desc" },
              include: {
                assets: {
                  where: { visibility: { in: ["PUBLIC", "ENTITLED"] } },
                  orderBy: { createdAt: "desc" },
                },
              },
            },
          },
        },
      },
    }),
    db.downloadEvent.count({ where: { userId } }),
  ]);

  return { user, licenses, downloadCount };
}

export default async function DashboardPage(props: DashboardPageProps) {
  const searchParams = await props.searchParams;
  const context = await getAuthContext();
  const checkoutSuccess = searchParams.checkout === "success";

  if (context.role === "owner" && context.userId) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-12 sm:px-6 lg:py-8">
        <section className="surface-panel rounded-[2rem] p-6 sm:p-8">
          <p className="section-eyebrow">Owner session</p>
          <h1 className="display-title mt-6 text-4xl font-semibold tracking-[-0.05em] text-white">
            This session is operating as owner.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            The buyer dashboard is intended for licensed user sessions. Since you are signed in as owner, the admin
            control plane is the correct route for release operations, moderation, vault access, and privileged review.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/admin" className="action-primary">
              Open admin console
            </Link>
            <Link href="/downloads" className="action-secondary">
              Review public downloads
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!context.userId) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-12 sm:px-6 lg:py-8">
        <section className="surface-panel rounded-[2rem] p-6 sm:p-8">
          <p className="section-eyebrow">Access cockpit</p>
          <h1 className="display-title mt-6 text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl">
            Licensed delivery, releases, and private follow-up land here.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300">
            This dashboard becomes active when a purchase flow establishes a user session. It is designed to surface
            entitled assets, release history, and secure delivery links without pushing people through the owner shell.
          </p>
          {checkoutSuccess ? (
            <div className="mt-6 rounded-[1.5rem] border border-emerald-300/20 bg-emerald-300/8 px-5 py-4 text-sm text-emerald-100">
              Checkout completed. If a user session was established, your licensed systems and assets will appear here
              immediately.
            </div>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/pricing" className="action-primary">
              Review pricing lanes
            </Link>
            <Link href="/downloads" className="action-secondary">
              Open downloads
            </Link>
            <Link href="/creator" className="action-secondary">
              Open creator center
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Licensed systems",
              copy: "Purchased applications can resolve into entitlement-aware assets and version history from this cockpit.",
            },
            {
              title: "Signed delivery",
              copy: "Entitled files route through short-lived signed URLs rather than raw permanent download links.",
            },
            {
              title: "Private follow-up",
              copy: "The dashboard is the public-safe layer between storefront checkout and deeper owner-side operations.",
            },
          ].map((card) => (
            <article key={card.title} className="surface-panel rounded-[1.6rem] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">{card.title}</p>
              <p className="mt-3 text-sm leading-7 text-slate-400">{card.copy}</p>
            </article>
          ))}
        </section>
      </main>
    );
  }

  const { user, licenses, downloadCount } = await getLicensedDashboardData(context.userId);
  const entitledAssetCount = licenses.reduce(
    (count, license) =>
      count +
      license.application.versions.reduce(
        (innerCount, version) =>
          innerCount + version.assets.filter((asset) => asset.visibility === "ENTITLED").length,
        0,
      ),
    0,
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-12 sm:px-6 lg:py-8">
      <section className="surface-panel rounded-[2rem] p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.06fr_0.94fr]">
          <div>
            <p className="section-eyebrow">Access cockpit</p>
            <h1 className="display-title mt-6 text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl">
              Licensed systems, release lanes, and secure delivery in one place.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300">
              Signed in as {user?.email ?? "licensed user"}. This cockpit is where purchase state resolves into active
              applications, release files, and short-lived access routes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/downloads" className="action-primary">
                Open release center
              </Link>
              <Link href="/applications" className="action-secondary">
                Revisit catalog
              </Link>
            </div>
            {checkoutSuccess ? (
              <div className="mt-6 rounded-[1.5rem] border border-emerald-300/20 bg-emerald-300/8 px-5 py-4 text-sm text-emerald-100">
                Checkout completed. The new license is now part of this session.
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-3">
            {[
              { value: `${licenses.length}`, label: "active licenses" },
              { value: `${entitledAssetCount}`, label: "entitled assets" },
              { value: `${downloadCount}`, label: "recorded downloads" },
            ].map((metric) => (
              <div key={metric.label} className="surface-panel rounded-[1.6rem] border-white/10 bg-white/[0.03] p-5">
                <p className="display-title text-3xl font-semibold tracking-[-0.05em] text-white">{metric.value}</p>
                <p className="mt-2 text-[0.72rem] uppercase tracking-[0.26em] text-slate-500">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 surface-panel rounded-[2rem] p-6 sm:p-8">
        <SectionHeading
          eyebrow="Licensed systems"
          title="Applications currently tied to this access session."
          description="Entitled assets use the same release data as the public site, but the delivery routes now honor active license state."
        />

        {licenses.length === 0 ? (
          <div className="mt-8 rounded-[1.6rem] border border-dashed border-white/12 bg-white/[0.02] px-5 py-10 text-sm leading-7 text-slate-400">
            No active licenses are attached to this session yet. Start from pricing or the public downloads lane if you
            need to purchase or revisit available release tracks.
          </div>
        ) : (
          <div className="mt-8 grid gap-4">
            {licenses.map((license) => {
              const latestVersion = license.application.versions[0];
              const latestAssets = latestVersion?.assets ?? [];
              return (
                <article key={license.id} className="surface-panel rounded-[1.8rem] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-4xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="signal-chip text-[0.68rem] uppercase tracking-[0.18em] text-slate-200">
                          Active license
                        </span>
                        {license.application.releaseChannel ? (
                          <span className="rounded-full border border-white/10 px-3 py-1 text-[0.68rem] uppercase tracking-[0.18em] text-slate-400">
                            {license.application.releaseChannel}
                          </span>
                        ) : null}
                      </div>
                      <h2 className="display-title mt-4 text-2xl font-semibold tracking-[-0.05em] text-white">
                        {license.application.name}
                      </h2>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{license.application.summary}</p>
                      <p className="mt-4 text-xs uppercase tracking-[0.22em] text-slate-500">
                        License active since {new Date(license.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                      <p className="font-semibold uppercase tracking-[0.22em] text-cyan-100/70">Latest release</p>
                      <p className="mt-3">{latestVersion?.version ?? "No versions published yet"}</p>
                      <p className="mt-2 text-slate-500">{latestAssets.length} accessible asset(s)</p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {latestAssets.length > 0 ? (
                      latestAssets.map((asset) => (
                        <a
                          key={asset.id}
                          href={`/api/download/${asset.id}?redirect=1`}
                          className="rounded-[1.4rem] border border-white/10 bg-slate-950/70 px-4 py-4 text-sm text-slate-200 hover:border-cyan-300/30 hover:text-white"
                        >
                          <span className="block font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
                            {asset.visibility === "ENTITLED" ? "Entitled asset" : "Public asset"}
                          </span>
                          <span className="mt-2 block font-medium">{asset.fileName}</span>
                          <span className="mt-2 block text-xs text-slate-500">
                            {asset.checksum ?? "Signed delivery route available"}
                          </span>
                        </a>
                      ))
                    ) : (
                      <div className="rounded-[1.4rem] border border-dashed border-white/12 bg-white/[0.02] px-4 py-4 text-sm text-slate-500">
                        No accessible assets are attached to the latest visible version yet.
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Short-lived links",
            copy: "Entitled assets resolve through signed routes so session state and access scope remain enforceable.",
          },
          {
            title: "Release-aware delivery",
            copy: "The cockpit stays aligned with version history rather than falling back to static one-off file handoff.",
          },
          {
            title: "Catalog continuity",
            copy: "Everything here maps back to the public-facing app and download surfaces, so product story and delivery stay in sync.",
          },
        ].map((card) => (
          <article key={card.title} className="surface-panel rounded-[1.6rem] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">{card.title}</p>
            <p className="mt-3 text-sm leading-7 text-slate-400">{card.copy}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
