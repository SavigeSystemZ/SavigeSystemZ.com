import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Plans and purchase options for SavigeSystemZ software and releases.",
};

export default function PricingPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">Pricing and Purchase</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border border-zinc-800 p-4">
          <h2 className="font-semibold">Starter</h2>
          <p className="mt-2 text-sm text-zinc-300">Entry access for public releases.</p>
        </section>
        <section className="rounded-lg border border-zinc-800 p-4">
          <h2 className="font-semibold">Pro</h2>
          <p className="mt-2 text-sm text-zinc-300">Advanced features and premium distributions.</p>
        </section>
      </div>
    </main>
  );
}
