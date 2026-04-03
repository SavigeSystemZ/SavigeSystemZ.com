import type { Metadata } from "next";
import Link from "next/link";
import { ApplicationManager } from "@/components/admin/application-manager";
import { PasskeyRegistration } from "@/components/admin/passkey-registration";

export const metadata: Metadata = {
  title: "Overview",
};

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-12 sm:px-6 lg:py-8">
      <section className="surface-panel rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/70">Owner control plane</p>
        <h1 className="display-title mt-3 text-4xl font-semibold tracking-[-0.05em] text-white">
          Owner Admin Console
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          This is the private operating surface behind the flagship site: application narrative, release operations,
          moderation, audit visibility, passkeys, and vault artifacts.
        </p>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-6">
        <section className="surface-panel rounded-[1.6rem] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Release operations</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">Create versions, manage delivery assets, and keep the public download center current.</p>
          <Link href="/admin/releases" className="action-secondary mt-5 text-xs">
            Open releases
          </Link>
        </section>
        <section className="surface-panel rounded-[1.6rem] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Application media</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">Attach flagship artwork, screenshots, and gallery media so catalog entries have visual depth.</p>
          <Link href="/admin/media" className="action-secondary mt-5 text-xs">
            Open media
          </Link>
        </section>
        <section className="surface-panel rounded-[1.6rem] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Foundry archive</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">Publish and maintain Linux builds, config packs, research notes, models, and non-app engineering drops.</p>
          <Link href="/admin/archive" className="action-secondary mt-5 text-xs">
            Open archive
          </Link>
        </section>
        <section className="surface-panel rounded-[1.6rem] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Project requests</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">Review inbound build requests and move them through the owner queue.</p>
          <Link href="/admin/requests" className="action-secondary mt-5 text-xs">
            Open requests
          </Link>
        </section>
        <section className="surface-panel rounded-[1.6rem] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Audit trail</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">Track privileged operations and release mutations in one searchable surface.</p>
          <Link href="/admin/audit" className="action-secondary mt-5 text-xs">
            Open audit
          </Link>
        </section>
        <section className="surface-panel rounded-[1.6rem] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Vault</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">Access encrypted owner-only artifacts, notes, and private workbench material.</p>
          <Link href="/admin/vault" className="action-secondary mt-5 text-xs">
            Open vault
          </Link>
        </section>
      </section>

      <div className="mt-6 grid gap-4 xl:grid-cols-[0.88fr_1.12fr]">
        <PasskeyRegistration />
        <ApplicationManager />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="surface-panel rounded-[1.6rem] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Moderation queue</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">Review live creator submissions and promote accepted work directly into draft application or archive records.</p>
          <Link href="/admin/moderation" className="action-secondary mt-5 text-xs">
            Open moderation
          </Link>
        </section>
        <section className="surface-panel rounded-[1.6rem] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Grounded concierge</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">The public AI dock now routes across live catalog, archive, pricing, creator, and owner knowledge instead of placeholder copy.</p>
        </section>
      </div>
    </main>
  );
}
