import type { ReactNode } from "react";

export function SectionCard(props: { title: string; children: ReactNode }): ReactNode {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-5">
      <h2 className="mb-2 text-lg font-semibold text-zinc-100">{props.title}</h2>
      <div className="text-sm text-zinc-300">{props.children}</div>
    </section>
  );
}
