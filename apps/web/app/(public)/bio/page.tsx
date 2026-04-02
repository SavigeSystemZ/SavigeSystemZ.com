import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bio",
  description: "Founder profile, capability depth, and technical background.",
};

export default function BioPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">Michael Spaulding (Sys Sav)</h1>
      <p className="mt-3 text-zinc-300">
        Builder of security-forward software systems, platform tooling, and advanced product experiences.
      </p>
      <section className="mt-6 rounded-lg border border-zinc-800 p-4">
        Resume-capability hybrid profile with project highlights, roadmap, and technical strengths.
      </section>
    </main>
  );
}
