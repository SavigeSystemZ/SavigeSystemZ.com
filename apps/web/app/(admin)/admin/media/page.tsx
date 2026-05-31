import type { Metadata } from "next";
import { ApplicationMediaManager } from "@/components/admin/application-media-manager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Media",
};

export default function AdminMediaPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-12 sm:px-6 lg:py-8">
      <section className="surface-panel rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/70">Visual publishing lane</p>
        <h1 className="display-title mt-3 text-4xl font-semibold tracking-[-0.05em] text-white">
          Application Media Console
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          Manage flagship artwork, gallery visuals, screenshots, and direct media uploads that feed the public
          application pages and catalog surfaces.
        </p>
      </section>

      <div className="mt-6">
        <ApplicationMediaManager />
      </div>
    </main>
  );
}
