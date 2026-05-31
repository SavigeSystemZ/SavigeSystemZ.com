import type { Metadata } from "next";
import Link from "next/link";
import { CreatorSubmissionsPanel } from "@/components/admin/creator-submissions-panel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Moderation",
};

export default function ModerationPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-12 sm:px-6 lg:py-8">
      <section className="surface-panel rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/70">Owner moderation</p>
        <h1 className="display-title mt-3 text-4xl font-semibold tracking-[-0.05em] text-white">
          Moderation Queue
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          This is the owner-side triage surface for creator intake. Review what comes in, decide whether it belongs in
          the application catalog or engineering archive, promote it directly into a draft record, and keep moderation
          notes attached to the item instead of losing context in chat threads.
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="surface-panel rounded-[1.6rem] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Creator center</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Public-facing intake for applications, archive drops, research kits, and system packs.
          </p>
          <Link href="/creator" className="action-secondary mt-5 text-xs">
            Open creator page
          </Link>
        </article>
        <article className="surface-panel rounded-[1.6rem] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Project requests</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Commercial build inquiries remain in the request queue. Use that lane for scoped work rather than creator
            publishing review.
          </p>
          <Link href="/admin/requests" className="action-secondary mt-5 text-xs">
            Open requests
          </Link>
        </article>
        <article className="surface-panel rounded-[1.6rem] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Audit trail</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Moderation mutations, release operations, and privileged owner actions all remain visible through audit.
          </p>
          <Link href="/admin/audit" className="action-secondary mt-5 text-xs">
            Open audit
          </Link>
        </article>
      </section>

      <div className="mt-6">
        <CreatorSubmissionsPanel />
      </div>
    </main>
  );
}
