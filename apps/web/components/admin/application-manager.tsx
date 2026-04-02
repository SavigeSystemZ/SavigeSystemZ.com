"use client";

import { useEffect, useState } from "react";

type AppItem = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  visibility: "PUBLIC" | "PRIVATE" | "DRAFT";
  featured: boolean;
};

export function ApplicationManager() {
  const [items, setItems] = useState<AppItem[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    slug: "",
    name: "",
    summary: "",
    visibility: "DRAFT" as const,
    featured: false,
  });

  useEffect(() => {
    fetch("/api/admin/applications", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          setError("Failed to load applications. Ensure owner login.");
          return;
        }
        const data = (await res.json()) as { items: AppItem[] };
        setItems(data.items);
      })
      .catch(() => setError("Failed to load applications. Ensure owner login."));
  }, []);

  async function load() {
    const res = await fetch("/api/admin/applications", { credentials: "include" });
    if (!res.ok) {
      setError("Failed to load applications. Ensure owner login.");
      return;
    }
    const data = (await res.json()) as { items: AppItem[] };
    setItems(data.items);
  }

  async function createApp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const res = await fetch("/api/admin/applications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      setError("Create failed. Check inputs and owner auth.");
      return;
    }
    setForm({ slug: "", name: "", summary: "", visibility: "DRAFT", featured: false });
    await load();
  }

  async function removeApp(id: string) {
    const res = await fetch(`/api/admin/applications/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      setError("Delete failed.");
      return;
    }
    await load();
  }

  return (
    <section className="rounded-lg border border-zinc-800 p-4">
      <h2 className="text-xl font-semibold">Application Manager</h2>
      <form onSubmit={createApp} className="mt-4 grid gap-2">
        <input
          className="rounded border border-zinc-700 bg-zinc-950 p-2"
          placeholder="slug"
          value={form.slug}
          onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
        />
        <input
          className="rounded border border-zinc-700 bg-zinc-950 p-2"
          placeholder="name"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
        />
        <textarea
          className="min-h-24 rounded border border-zinc-700 bg-zinc-950 p-2"
          placeholder="summary"
          value={form.summary}
          onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
        />
        <button className="rounded bg-cyan-400 px-4 py-2 font-medium text-zinc-950">Create app</button>
      </form>
      {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
      <ul className="mt-4 grid gap-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between rounded border border-zinc-800 p-2">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-zinc-400">{item.slug}</p>
            </div>
            <button onClick={() => removeApp(item.id)} className="text-sm text-red-400">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
