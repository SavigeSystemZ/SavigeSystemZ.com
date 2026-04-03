import Link from "next/link";

type HeroProps = {
  catalogCount: number;
  featuredCount: number;
  archiveCount: number;
};

export function Hero({ catalogCount, featuredCount, archiveCount }: HeroProps) {
  const quickMetrics = [
    { value: `${catalogCount}`, label: "catalog systems" },
    { value: `${featuredCount}`, label: "featured launches" },
    { value: `${archiveCount}`, label: "archive drops" },
  ];

  const statusCards = [
    {
      title: "Public showcase",
      copy: "Applications, pricing, downloads, founder signal, and moderated trust surfaces.",
    },
    {
      title: "Owner operations",
      copy: "Admin console, release control, audits, passkeys, and encrypted vault workflows.",
    },
    {
      title: "Engineering archive",
      copy: "Prepared to publish scripts, Linux builds, configs, containers, models, and research drops.",
    },
  ];

  return (
    <section className="surface-panel scanline relative rounded-[2rem] px-6 py-8 sm:px-8 sm:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(101,243,255,0.2),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(249,188,97,0.14),transparent_24%)]" />
      <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="section-eyebrow">Foundry / Ops / Research</p>
          <h1 className="display-title mt-6 max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl">
            An operator-grade home for products, releases, systems work, and private engineering flows.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
            SavigeSystemZ is built to sell and showcase software in public, manage sensitive owner workflows in
            private, and surface the rest of the engineering stack: Linux builds, scripts, containers, configs,
            models, notes, and research artifacts.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/applications" className="action-primary">
              Explore the catalog
            </Link>
            <Link href="/archive" className="action-secondary">
              Browse the archive
            </Link>
            <Link href="/services" className="action-secondary">
              Commission a build
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="signal-chip text-xs uppercase tracking-[0.26em] text-slate-200">
              Secure owner routes
            </span>
            <span className="signal-chip text-xs uppercase tracking-[0.26em] text-slate-200">
              Signed downloads
            </span>
            <span className="signal-chip text-xs uppercase tracking-[0.26em] text-slate-200">
              AI concierge surface
            </span>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="surface-panel drift-slow rounded-[1.6rem] border-white/10 bg-white/[0.03] p-5">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-cyan-100/80">
              Command deck
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-200">
              The platform is designed as both a world-class public showcase and an IT engineer’s private operating
              playground.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-3">
              {quickMetrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-white/8 bg-slate-950/70 p-4">
                  <p className="display-title text-3xl font-semibold tracking-[-0.05em] text-white">
                    {metric.value}
                  </p>
                  <p className="mt-2 text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {statusCards.map((card, index) => (
              <div
                key={card.title}
                className={`surface-panel rounded-[1.4rem] p-5 ${index === 1 ? "drift-fast" : ""}`}
              >
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">{card.title}</p>
                <p className="mt-3 text-sm leading-7 text-slate-400">{card.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
