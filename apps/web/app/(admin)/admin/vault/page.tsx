import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Vault",
};

export default function VaultAdminPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Private Vault Manager</h1>
      <p className="mt-2 max-w-2xl text-zinc-300">
        Owner-scoped storage for sensitive artifacts, draft materials, and internal references. Access is enforced by
        session and future entitlement rules.
      </p>
      <ul className="mt-6 list-inside list-disc space-y-2 text-sm text-zinc-400">
        <li>
          Review privileged actions in the{" "}
          <Link href="/admin/audit" className="text-cyan-400 hover:text-cyan-300">
            audit log
          </Link>
          .
        </li>
        <li>
          Customer-facing vault UX may mirror{" "}
          <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300">
            dashboard
          </Link>{" "}
          patterns when wired to entitlements.
        </li>
      </ul>
      <section className="mt-8 rounded-lg border border-dashed border-zinc-700 p-4 text-sm text-zinc-500">
        <p className="font-medium text-zinc-400">Implementation note</p>
        <p className="mt-2">
          Connect <code className="text-zinc-400">/api/vault</code> to encrypted object storage and row-level ACLs. Keep
          download signing and audit hooks aligned with release assets.
        </p>
      </section>
    </main>
  );
}
