import type { Metadata } from "next";
import { AuditViewer } from "@/components/admin/audit-viewer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Audit",
};

export default function AuditPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Audit Log</h1>
      <p className="mt-2 text-zinc-300">Sensitive actions and license grants with export-friendly JSON API.</p>
      <div className="mt-4">
        <AuditViewer />
      </div>
      <p className="mt-4 text-xs text-zinc-500">
        Export: GET{" "}
        <code className="text-cyan-400">/api/admin/audit-logs?limit=200</code> with owner session. Optional query
        params: <code className="text-cyan-400">action</code>, <code className="text-cyan-400">targetType</code> (e.g.{" "}
        <code className="text-cyan-400">vault</code>).
      </p>
    </main>
  );
}
