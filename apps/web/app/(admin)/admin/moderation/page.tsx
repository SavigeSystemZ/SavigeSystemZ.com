import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Moderation",
};

export default function ModerationPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Moderation Queue</h1>
      <p className="mt-2 max-w-2xl text-zinc-300">
        Inbound comments and creator submissions are staged for review. Public intake endpoints acknowledge receipt; this
        console is the operational view for approvals and follow-up.
      </p>
      <ul className="mt-6 list-inside list-disc space-y-2 text-sm text-zinc-400">
        <li>
          New project inquiries land in{" "}
          <Link href="/admin/requests" className="text-cyan-400 hover:text-cyan-300">
            inbound requests
          </Link>
          .
        </li>
        <li>
          Correlated security-sensitive actions (admin CRUD, passkeys, licenses) appear in the{" "}
          <Link href="/admin/audit" className="text-cyan-400 hover:text-cyan-300">
            audit log
          </Link>
          .
        </li>
        <li>
          Ship artifacts and changelogs from{" "}
          <Link href="/admin/releases" className="text-cyan-400 hover:text-cyan-300">
            Release operations
          </Link>
          .
        </li>
      </ul>
      <section className="mt-8 rounded-lg border border-dashed border-zinc-700 p-4 text-sm text-zinc-500">
        <p className="font-medium text-zinc-400">Pipeline (next integration)</p>
        <p className="mt-2">
          Wire this view to persisted submission/comment tables and owner actions (approve, reject, hold). Until then, use
          audit + releases for traceability.
        </p>
      </section>
    </main>
  );
}
