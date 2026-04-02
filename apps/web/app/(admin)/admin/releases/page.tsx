import type { Metadata } from "next";
import { ReleaseManager } from "@/components/admin/release-manager";

export const metadata: Metadata = {
  title: "Releases",
};

export default function ReleaseAdminPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Release Operations</h1>
      <p className="mt-2 text-zinc-300">Manage artifacts, changelogs, and immutable release versions.</p>
      <div className="mt-4">
        <ReleaseManager />
      </div>
    </main>
  );
}
