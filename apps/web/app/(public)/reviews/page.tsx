import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { trustSignals } from "@/lib/showcase-content";

export const metadata: Metadata = {
  title: "Reviews",
  description: "Moderated ratings and social proof for SavigeSystemZ offerings.",
};

export default function ReviewsPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-12 sm:px-6 lg:py-8">
      <section className="surface-panel rounded-[2rem] p-6 sm:p-8">
        <SectionHeading
          eyebrow="Reviews"
          title="Trust surfaces should reward real delivery, not noise."
          description="This page is positioned as a moderated proof layer for buyer feedback, collaboration outcomes, and future verified purchase reviews. The goal is signal quality, not inflated vanity metrics."
          action={
            <Link href="/pricing" className="action-secondary text-sm">
              Review pricing
            </Link>
          }
        />
      </section>

      <section className="mt-8 grid gap-4 xl:grid-cols-3">
        {trustSignals.map((signal) => (
          <article key={signal.title} className="surface-panel rounded-[1.8rem] p-6">
            <h2 className="display-title text-2xl font-semibold tracking-[-0.04em] text-white">{signal.title}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">{signal.summary}</p>
            <p className="mt-4 text-sm leading-7 text-slate-400">{signal.detail}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        {[
          {
            title: "Verified buyers",
            detail: "Future product reviews can be tied to actual purchase or entitlement state instead of open anonymous posting.",
          },
          {
            title: "Project engagements",
            detail: "Custom-build feedback can be curated separately from public product reviews so the signal stays honest.",
          },
          {
            title: "Moderation and audit",
            detail: "Trust surfaces should inherit the same discipline as the rest of the platform: moderation, logging, and explicit control.",
          },
        ].map((item) => (
          <article key={item.title} className="surface-panel rounded-[1.6rem] p-6">
            <h2 className="text-xl font-semibold text-white">{item.title}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">{item.detail}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
