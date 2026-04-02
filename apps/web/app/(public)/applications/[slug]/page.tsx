import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckoutCta } from "@/components/checkout-cta";
import { getPublicApplicationBySlug } from "@/lib/catalog-resolver";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const app = await getPublicApplicationBySlug(params.slug);
  if (!app) return { title: "Not found" };
  return {
    title: app.name,
    description: app.summary,
  };
}

export default async function ApplicationDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const app = await getPublicApplicationBySlug(params.slug);
  if (!app) notFound();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
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
      <h1 className="text-3xl font-bold">{app.name}</h1>
      <p className="mt-2 max-w-2xl text-zinc-300">{app.summary}</p>
      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-800 p-4">Release timeline scaffold</div>
        <div className="rounded-lg border border-zinc-800 p-4">Media gallery scaffold</div>
        <div className="rounded-lg border border-zinc-800 p-4">
          <p className="text-sm font-medium text-zinc-200">Purchase</p>
          <p className="mt-1 text-xs text-zinc-500">Mock or Stripe checkout from this catalog entry.</p>
          <CheckoutCta applicationId={app.id} />
        </div>
      </section>
    </main>
  );
}
