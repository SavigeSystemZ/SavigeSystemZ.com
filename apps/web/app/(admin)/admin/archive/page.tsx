import type { Metadata } from "next";
import { ArchiveManager } from "@/components/admin/archive-manager";

export const metadata: Metadata = {
  title: "Archive",
};

export default function AdminArchivePage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-12 sm:px-6 lg:py-8">
      <section className="surface-panel rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/70">Foundry publication lane</p>
        <h1 className="display-title mt-3 text-4xl font-semibold tracking-[-0.05em] text-white">
          Archive Console
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          Manage the broader engineering archive that sits around the application catalog: builds, stacks, configs,
          research, AI work, and other operator-grade drops.
        </p>
      </section>

      <div className="mt-6">
        <ArchiveManager />
      </div>
    </main>
  );
}
