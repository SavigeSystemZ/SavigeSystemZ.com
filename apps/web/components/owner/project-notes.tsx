"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Panel } from "@savige/ui";

type Note = {
  id: string;
  title: string;
  bodyMarkdown: string;
  pinned: boolean;
  createdAt: Date;
};

export function ProjectNotes({ projectId, initialNotes }: { projectId: string; initialNotes: Note[] }) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ title: "", bodyMarkdown: "", pinned: false });
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`/api/owner/projects/${projectId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowAdd(false);
        setFormData({ title: "", bodyMarkdown: "", pinned: false });
        router.refresh();
      } else {
        alert("Failed to save note");
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6 mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Notes & Ideas</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="action-primary bg-rose-600 hover:bg-rose-500 text-white">
          {showAdd ? "Cancel" : "Add Note"}
        </button>
      </div>

      {showAdd && (
        <Panel className="p-5 rounded-2xl border-rose-500/20">
          <form onSubmit={handleSave} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Title</label>
              <input
                type="text"
                required
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-rose-500/50"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Content (Markdown)</label>
              <textarea
                required
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-rose-500/50 h-32 resize-none font-mono"
                value={formData.bodyMarkdown}
                onChange={(e) => setFormData({ ...formData, bodyMarkdown: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pinned"
                checked={formData.pinned}
                onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                className="rounded border-white/10 bg-black/40 text-rose-500 focus:ring-rose-500/50"
              />
              <label htmlFor="pinned" className="text-sm text-slate-300">Pin to workspace dashboard</label>
            </div>
            <div className="pt-2">
              <button type="submit" className="action-primary bg-rose-600 hover:bg-rose-500 text-white" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Note"}
              </button>
            </div>
          </form>
        </Panel>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {initialNotes.map((note) => (
          <Panel key={note.id} className={`p-5 rounded-2xl ${note.pinned ? "border-l-2 border-l-rose-500" : ""}`}>
            <h3 className="font-semibold text-white mb-2">{note.title}</h3>
            <p className="text-sm text-slate-300 line-clamp-4 font-mono whitespace-pre-wrap">{note.bodyMarkdown}</p>
            <p className="text-xs text-slate-500 mt-4 text-right">
              {new Date(note.createdAt).toLocaleDateString()}
            </p>
          </Panel>
        ))}
        {initialNotes.length === 0 && !showAdd && (
          <div className="col-span-full py-8 text-center border border-dashed border-white/10 rounded-2xl">
            <p className="text-slate-400">No notes yet. Add one to keep track of your thoughts.</p>
          </div>
        )}
      </div>
    </div>
  );
}
