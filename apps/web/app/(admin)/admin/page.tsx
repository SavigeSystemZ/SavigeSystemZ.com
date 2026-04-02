import type { Metadata } from "next";
import Link from "next/link";
import { ApplicationManager } from "@/components/admin/application-manager";
import { PasskeyRegistration } from "@/components/admin/passkey-registration";

export const metadata: Metadata = {
  title: "Overview",
};

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Owner Admin Console</h1>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <PasskeyRegistration />
        <ApplicationManager />
        <section className="rounded-lg border border-zinc-800 p-4">
          <h2 className="text-sm font-semibold text-zinc-200">Moderation queue</h2>
          <p className="mt-1 text-xs text-zinc-500">Review submissions and flagged content.</p>
          <Link
            href="/admin/moderation"
            className="mt-3 inline-block text-sm text-cyan-400 hover:text-cyan-300"
          >
            Open moderation →
          </Link>
        </section>
        <section className="rounded-lg border border-zinc-800 p-4">
          <h2 className="text-sm font-semibold text-zinc-200">AI knowledge manager</h2>
          <p className="mt-1 text-xs text-zinc-500">Tune concierge context and canned responses (coming soon).</p>
        </section>
        <section className="rounded-lg border border-zinc-800 p-4 md:col-span-2">
          <h2 className="text-sm font-semibold text-zinc-200">Vault and private workbench</h2>
          <p className="mt-1 text-xs text-zinc-500">Owner-only artifacts and internal notes.</p>
          <Link href="/admin/vault" className="mt-3 inline-block text-sm text-cyan-400 hover:text-cyan-300">
            Open vault →
          </Link>
        </section>
      </div>
    </main>
  );
}
