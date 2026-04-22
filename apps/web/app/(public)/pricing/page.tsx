import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@savige/ui";
import { pricingPlans } from "@/lib/showcase-content";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Plans and purchase options for SavigeSystemZ software and releases.",
};

export default function PricingPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-12 sm:px-6 lg:py-8">
      <section className="surface-panel rounded-[2rem] p-6 sm:p-8">
        <SectionHeading
          eyebrow="Pricing"
          title="Multiple ways to buy work from the foundry."
          description="Some work belongs in public catalog drops. Some belongs in scoped engagements or longer partnerships. The pricing surface is structured to support all three without confusing the visitor."
          action={
            <Link href="/services" className="action-primary text-xs">
              Scope a project
            </Link>
          }
        />
      </section>

      <section className="mt-8 grid gap-4 xl:grid-cols-3">
        {pricingPlans.map((plan) => (
          <article key={plan.name} className="surface-panel rounded-[1.8rem] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="display-title text-2xl font-semibold tracking-[-0.04em] text-white">{plan.name}</h2>
                <p className="mt-2 text-[0.72rem] uppercase tracking-[0.28em] text-cyan-100/70">{plan.price}</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-7 text-slate-300">{plan.summary}</p>
            <div className="mt-6 grid gap-3">
              {plan.bullets.map((bullet) => (
                <div key={bullet} className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4 text-sm text-slate-200">
                  {bullet}
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <article className="surface-panel rounded-[2rem] p-6 sm:p-8">
          <SectionHeading
            eyebrow="Commerce posture"
            title="The site can handle lightweight product purchases and deeper custom work."
            description="Checkout and webhook infrastructure already exist for productized offers, while the project-request path gives you a direct lane into custom engineering engagements."
          />
        </article>

        <article className="surface-panel rounded-[2rem] p-6 sm:p-8">
          <SectionHeading
            eyebrow="Routing"
            title="Need something that does not fit a simple price card?"
            description="Use the services route for infrastructure, local environment design, internal tools, security-forward systems, or anything that belongs in a more consultative delivery lane."
            action={
              <Link href="/applications" className="action-secondary text-sm">
                Browse product surfaces
              </Link>
            }
          />
        </article>
      </section>
    </main>
  );
}
