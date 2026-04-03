"use client";

import { useState } from "react";

export function ProjectRequestForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  /** Honeypot — leave blank (bots often fill hidden URL fields). */
  const [websiteHp, setWebsiteHp] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const payload: {
      title: string;
      description: string;
      contactEmail?: string;
      website?: string;
    } = { title, description, website: websiteHp };
    const trimmed = contactEmail.trim();
    if (trimmed) payload.contactEmail = trimmed;

    const res = await fetch("/api/project-requests", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string };

    if (res.status === 429) {
      setStatus("err");
      setMessage("Too many submissions. Please wait a minute and try again.");
      return;
    }

    if (!res.ok) {
      setStatus("err");
      setMessage(
        data.error === "invalid_payload"
          ? "Please check the fields: title and a detailed description (10+ characters) are required."
          : "Could not submit. Try again later.",
      );
      return;
    }

    setStatus("ok");
    setMessage(
      data.id
        ? `Request received (ref ${data.id.slice(0, 8)}…). If you provided an email, we may follow up there.`
        : "Request received. If you provided an email, we may follow up there.",
    );
    setTitle("");
    setDescription("");
    setContactEmail("");
    setWebsiteHp("");
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="surface-panel mt-6 grid gap-4 rounded-[1.6rem] p-5 sm:p-6"
    >
      <p className="text-xs leading-relaxed text-slate-500">
        Submissions are stored for review. Optional email is only used to follow up about your request. Do not include
        passwords or other secrets in the description.
      </p>
      <label className="grid gap-1 text-sm">
        <span className="text-slate-300">Project title</span>
        <input
          required
          className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/40"
          placeholder="e.g. Internal tooling for release automation"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoComplete="off"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="text-slate-300">Requirements</span>
        <textarea
          required
          minLength={10}
          className="min-h-36 rounded-[1.4rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/40"
          placeholder="Objectives, constraints, timeline, budget range, and success criteria."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="text-slate-300">Contact email (optional)</span>
        <input
          type="email"
          className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/40"
          placeholder="you@company.com"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          autoComplete="email"
        />
      </label>
      <label className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0" aria-hidden="true">
        <span>Company website</span>
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={websiteHp}
          onChange={(e) => setWebsiteHp(e.target.value)}
        />
      </label>
      {message ? (
        <p
          className={`text-sm ${
            status === "ok" ? "text-cyan-200" : status === "err" ? "text-red-300" : "text-slate-400"
          }`}
        >
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === "loading"}
        className="action-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "loading" ? "Submitting…" : "Submit request"}
      </button>
    </form>
  );
}
