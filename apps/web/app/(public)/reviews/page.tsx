import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reviews",
  description: "Moderated ratings and social proof for SavigeSystemZ offerings.",
};

export default function ReviewsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">Reviews and Ratings</h1>
      <p className="mt-2 text-zinc-300">Moderated trust layer for social proof and quality feedback.</p>
    </main>
  );
}
