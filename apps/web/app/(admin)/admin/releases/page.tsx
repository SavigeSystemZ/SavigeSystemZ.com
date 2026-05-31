import type { Metadata } from "next";
import { ReleaseManager } from "@/components/admin/release-manager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Releases",
};

export default function ReleaseAdminPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-12 sm:px-6 lg:py-8">
      <section className="surface-panel rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/70">Owner / Release operations</p>
        <h1 className="display-title mt-3 text-4xl font-semibold tracking-[-0.05em] text-white">
          Release Operations
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          Manage launch composition, version history, delivery files, entitlements, and publish hygiene from one
          place. This is the control plane behind the public download center and first-launch choreography.
        </p>
      </section>
      <div className="mt-6">
        <ReleaseManager />
      </div>
    </main>
  );
}
