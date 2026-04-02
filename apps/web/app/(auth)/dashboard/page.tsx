import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Purchased downloads, licenses, and saved applications.",
};

export default function DashboardPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">User Dashboard</h1>
      <p className="mt-2 text-zinc-300">Purchased downloads, licenses, and saved applications appear here.</p>
    </main>
  );
}
