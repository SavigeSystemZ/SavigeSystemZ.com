import type { PublicApplicationMediaRecord } from "@/lib/catalog-resolver";

type ApplicationMediaGalleryProps = {
  items: PublicApplicationMediaRecord[];
};

function backgroundStyle(url: string) {
  return { backgroundImage: `url(${url})` };
}

export function ApplicationMediaGallery({ items }: ApplicationMediaGalleryProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-[1.8rem] border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm leading-7 text-slate-400">
        Flagship media has not been attached to this application yet. Owner uploads and showcase artwork appear
        here once they are published.
      </div>
    );
  }

  const [primary, ...secondary] = items;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <article className="group relative min-h-[24rem] overflow-hidden rounded-[1.9rem] border border-white/10 bg-slate-950/80">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.03]"
          style={backgroundStyle(primary.mediaUrl)}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.12),rgba(2,6,23,0.88)_74%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.24),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(251,191,36,0.16),transparent_30%)]" />
        <div className="relative flex min-h-[24rem] flex-col justify-end p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-cyan-100/80">
            <span className="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-1">
              Flagship media
            </span>
            {primary.featured ? (
              <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-amber-100">
                Featured visual
              </span>
            ) : null}
          </div>
          <h3 className="display-title mt-5 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
            {primary.title}
          </h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200">
            {primary.description ?? primary.altText}
          </p>
        </div>
      </article>

      <div className="grid gap-4">
        {secondary.length > 0 ? (
          secondary.map((item) => (
            <article
              key={item.id}
              className="group relative min-h-[11.5rem] overflow-hidden rounded-[1.6rem] border border-white/10 bg-slate-950/80"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.04]"
                style={backgroundStyle(item.thumbnailUrl ?? item.mediaUrl)}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.82)_78%)]" />
              <div className="relative flex min-h-[11.5rem] flex-col justify-end p-5">
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.description ?? item.altText}</p>
              </div>
            </article>
          ))
        ) : (
          <article className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">Gallery lane</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Additional visual frames can be attached here for workflows, release imagery, screenshots, or brand art.
            </p>
          </article>
        )}
      </div>
    </div>
  );
}
