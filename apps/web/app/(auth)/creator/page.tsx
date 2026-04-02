import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creator",
  description: "Submit software for review and track moderation status.",
};

export default function CreatorPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">Creator Submission Center</h1>
      <p className="mt-2 text-zinc-300">
        Submit software, track review status, and receive moderation decisions.
      </p>
    </main>
  );
}
