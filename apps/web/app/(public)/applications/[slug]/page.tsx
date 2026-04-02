import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { appCatalog } from "@/lib/catalog";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const app = appCatalog.find((item) => item.slug === params.slug);
  if (!app) return { title: "Not found" };
  return {
    title: app.name,
    description: app.summary,
  };
}

export default async function ApplicationDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const app = appCatalog.find((item) => item.slug === params.slug);
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
        <div className="rounded-lg border border-zinc-800 p-4">Downloads and entitlement scaffold</div>
      </section>
    </main>
  );
}
