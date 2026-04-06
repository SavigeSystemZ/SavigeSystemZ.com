"use client";

import { useState } from "react";
import {
  creatorSubmissionTypeDescriptions,
  creatorSubmissionTypeLabels,
  creatorSubmissionTypeOptions,
} from "@/lib/creator-submission-taxonomy";

type FormState = {
  title: string;
  type: (typeof creatorSubmissionTypeOptions)[number];
  summary: string;
  details: string;
  plannedVisibility: "PUBLIC" | "PRIVATE" | "DRAFT";
  contactEmail: string;
  repoUrl: string;
  artifactUrl: string;
  website: string;
};

const inputClass =
  "rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/40";
const textareaClass =
  "min-h-32 rounded-[1.4rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/40";

const initialState: FormState = {
  title: "",
  type: "APPLICATION",
  summary: "",
  details: "",
  plannedVisibility: "DRAFT",
  contactEmail: "",
  repoUrl: "",
  artifactUrl: "",
  website: "",
};

export function CreatorSubmissionForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"idle" | "success" | "error">("idle");

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setTone("idle");

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        status?: string;
        issues?: Array<{ path?: Array<string | number>; message?: string }>;
      };

      if (!response.ok) {
        if (data.error === "rate_limited") {
          setTone("error");
          setMessage("Submission rate limit reached. Wait a minute and try again.");
        } else if (data.error === "invalid_payload") {
          const issue = data.issues?.[0];
          setTone("error");
          setMessage(
            issue?.path?.length
              ? `Check ${issue.path.join(".")}: ${issue.message ?? "invalid field"}`
              : "The submission payload is incomplete or invalid.",
          );
        } else {
          setTone("error");
          setMessage("The submission could not be staged for moderation.");
        }
        return;
      }

      setTone("success");
      setMessage(
        data.status === "queued_for_moderation"
          ? "Submission staged for moderation. If you included contact info, follow-up can happen off-platform."
          : "Submission received.",
      );
      setForm(initialState);
    } catch {
      setTone("error");
      setMessage("The submission request did not complete. Try again shortly.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="surface-panel rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="section-eyebrow">Creator intake</p>
          <h2 className="display-title mt-5 text-3xl font-semibold tracking-[-0.05em] text-white">
            Submit a build, archive artifact, or system pack for review.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Creator submissions are staged into moderation before they reach the public catalog, archive, or private
            delivery lanes. Use this when something deserves a proper release surface instead of a loose link.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
          <p className="font-semibold uppercase tracking-[0.24em] text-cyan-100/70">Current lane</p>
          <p className="mt-3">{creatorSubmissionTypeDescriptions[form.type]}</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-8 grid gap-4">
        <input
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(event) => updateField("website", event.target.value)}
          aria-hidden="true"
        />

        <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
          <input
            className={inputClass}
            placeholder="Submission title"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
          />
          <select
            className={inputClass}
            value={form.type}
            aria-label="Submission type"
            onChange={(event) => updateField("type", event.target.value as FormState["type"])}
          >
            {creatorSubmissionTypeOptions.map((type) => (
              <option key={type} value={type}>
                {creatorSubmissionTypeLabels[type]}
              </option>
            ))}
          </select>
        </div>

        <textarea
          className={textareaClass}
          placeholder="Short framing: what this is, who it is for, and why it deserves a proper release surface."
          value={form.summary}
          onChange={(event) => updateField("summary", event.target.value)}
        />

        <textarea
          className={textareaClass}
          placeholder="Longer operating context, scope, packaging state, and anything moderation should know before routing it into the public shell."
          value={form.details}
          onChange={(event) => updateField("details", event.target.value)}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <select
            className={inputClass}
            value={form.plannedVisibility}
            aria-label="Planned visibility"
            onChange={(event) =>
              updateField("plannedVisibility", event.target.value as FormState["plannedVisibility"])
            }
          >
            <option value="DRAFT">Draft / staged</option>
            <option value="PRIVATE">Private / controlled</option>
            <option value="PUBLIC">Public / showcase-ready</option>
          </select>
          <input
            className={inputClass}
            type="email"
            placeholder="contact@example.com"
            value={form.contactEmail}
            onChange={(event) => updateField("contactEmail", event.target.value)}
          />
          <input
            className={inputClass}
            placeholder="Repository URL"
            value={form.repoUrl}
            onChange={(event) => updateField("repoUrl", event.target.value)}
          />
        </div>

        <input
          className={inputClass}
          placeholder="Artifact / preview URL"
          value={form.artifactUrl}
          onChange={(event) => updateField("artifactUrl", event.target.value)}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p
            className={`text-sm ${
              tone === "error" ? "text-rose-300" : tone === "success" ? "text-emerald-300" : "text-slate-400"
            }`}
          >
            {message || "Submissions enter moderation before they are routed into public or private delivery surfaces."}
          </p>
          <button type="submit" disabled={busy} className="action-primary text-xs">
            {busy ? "Staging submission…" : "Submit for moderation"}
          </button>
        </div>
      </form>
    </section>
  );
}
