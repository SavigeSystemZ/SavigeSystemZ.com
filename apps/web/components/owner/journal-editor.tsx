"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Panel } from "@savige/ui";

type Journal = {
  id: string;
  date: string | Date;
  bodyMarkdown: string;
};

export function JournalEditor({ journals }: { journals: Journal[] }) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  
  const currentJournal = journals.find(
    (j) => new Date(j.date).toISOString().split("T")[0] === selectedDate
  );

  const [bodyMarkdown, setBodyMarkdown] = useState(currentJournal?.bodyMarkdown || "");
  const [isSaving, setIsSaving] = useState(false);

  // Update editor when date changes
  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    const existing = journals.find(
      (j) => new Date(j.date).toISOString().split("T")[0] === newDate
    );
    setBodyMarkdown(existing?.bodyMarkdown || "");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/owner/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date(selectedDate).toISOString(),
          bodyMarkdown,
        }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to save journal.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <aside className="space-y-4">
        <Panel className="p-5 rounded-2xl border-rose-500/20">
          <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-rose-500/50"
          />
        </Panel>

        <Panel className="p-5 rounded-2xl">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Recent Entries</h2>
          <div className="space-y-2">
            {journals.slice(0, 7).map((j) => (
              <button
                key={j.id}
                onClick={() => {
                  const d = new Date(j.date).toISOString().split("T")[0];
                  setSelectedDate(d);
                  setBodyMarkdown(j.bodyMarkdown);
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                  selectedDate === new Date(j.date).toISOString().split("T")[0]
                    ? "bg-rose-500/20 text-rose-200"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {new Date(j.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </button>
            ))}
            {journals.length === 0 && <p className="text-xs text-slate-500">No previous entries.</p>}
          </div>
        </Panel>
      </aside>

      <Panel className="p-6 rounded-2xl flex flex-col h-[600px] border-rose-500/10">
        <form onSubmit={handleSave} className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h2>
            <button type="submit" className="action-primary bg-rose-600 hover:bg-rose-500 text-white" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Entry"}
            </button>
          </div>
          <textarea
            value={bodyMarkdown}
            onChange={(e) => setBodyMarkdown(e.target.value)}
            placeholder="Write your daily log, thoughts, or ideas here (Markdown supported)..."
            className="w-full flex-1 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-slate-200 outline-none focus:border-rose-500/50 resize-none font-mono"
          />
        </form>
      </Panel>
    </div>
  );
}
