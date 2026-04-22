import type { Metadata } from "next";
import { CodePanel } from "@/components/admin/code-panel";

export const metadata: Metadata = {
  title: "Code",
};

export const dynamic = "force-dynamic";

export default function CodePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Code repositories</h1>
      <p className="mt-2 text-zinc-300">
        Track GitHub repositories and mirror their metadata here. Source code stays on
        GitHub (until the self-hosted storage milestone lands); this view gives you a
        single owner-scoped dashboard for stars, branches, and the latest commit.
      </p>
      <div className="mt-6">
        <CodePanel />
      </div>
    </main>
  );
}
