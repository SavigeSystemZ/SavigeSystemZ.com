"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Panel, StatusChip } from "@savige/ui";

type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  status: "IDEA" | "ACTIVE" | "PAUSED" | "SHIPPED" | "ARCHIVED";
  priority: "LOW" | "MED" | "HIGH";
  _count: {
    notes: number;
    artifacts: number;
  };
};

export function ProjectList({ initialProjects }: { initialProjects: Project[] }) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<string>("ALL");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    summary: "",
    status: "IDEA",
    priority: "MED",
  });

  const filteredProjects = projects.filter((p) => filter === "ALL" || p.status === filter);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/owner/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      const newProj = await res.json();
      setProjects([ { ...newProj, _count: { notes: 0, artifacts: 0 } }, ...projects]);
      setShowCreate(false);
      setFormData({ title: "", slug: "", summary: "", status: "IDEA", priority: "MED" });
      router.refresh();
    } else {
      alert("Failed to create project");
    }
  }

  function generateSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "IDEA", "ACTIVE", "PAUSED", "SHIPPED", "ARCHIVED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] transition-colors ${
                filter === f
                  ? "border-rose-400/60 bg-rose-500/20 text-rose-100"
                  : "border-white/10 text-slate-400 hover:border-white/30"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="action-primary bg-rose-600 hover:bg-rose-500 text-white">
          {showCreate ? "Cancel" : "New Project"}
        </button>
      </div>

      {showCreate && (
        <Panel className="p-6 rounded-2xl border-rose-500/20">
          <form onSubmit={handleCreate} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Title</label>
              <input
                type="text"
                required
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-rose-500/50"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) });
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Slug</label>
              <input
                type="text"
                required
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-rose-500/50"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Summary</label>
              <textarea
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-rose-500/50 h-20"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Status</label>
                <select
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-rose-500/50"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="IDEA">IDEA</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PAUSED">PAUSED</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Priority</label>
                <select
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-rose-500/50"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="LOW">LOW</option>
                  <option value="MED">MED</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>
            </div>
            <div className="pt-2">
              <button type="submit" className="action-primary bg-rose-600 hover:bg-rose-500 text-white">
                Save Project
              </button>
            </div>
          </form>
        </Panel>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Panel key={project.id} className="p-5 rounded-2xl flex flex-col h-full hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="font-semibold text-white truncate">{project.title}</h3>
              <StatusChip variant={project.status === "ACTIVE" ? "success" : "info"} className="text-[0.62rem]">
                {project.status}
              </StatusChip>
            </div>
            <p className="text-sm text-slate-300 line-clamp-3 mb-4 flex-1">
              {project.summary || "No summary provided."}
            </p>
            <div className="mt-auto flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium tracking-wider">
                <span>{project._count.notes} Notes</span>
                <span>{project._count.artifacts} Artifacts</span>
              </div>
              <Link href={`/owner/projects/${project.slug}`} className="text-xs text-rose-300 hover:text-rose-200 uppercase tracking-widest font-medium">
                Open →
              </Link>
            </div>
          </Panel>
        ))}
        {filteredProjects.length === 0 && (
          <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-2xl">
            <p className="text-slate-400">No projects found matching the filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
