"use client";

import Link from "next/link";
import { useState } from "react";

type OperatorMessage = {
  role: "user" | "assistant";
  text: string;
  routes?: Array<{
    href: string;
    label: string;
    reason: string;
  }>;
  highlights?: string[];
};

const quickPrompts = [
  "What is the current health status?",
  "Are there any repository sync errors?",
  "Check the moderation queue",
  "Are there any audit bursts?",
];

export function OperatorDock() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<OperatorMessage[]>([
    {
      role: "assistant",
      text: "I am the owner copilot. I can summarize admin health, audit logs, repo sync status, and moderation queues.",
      routes: [
        { href: "/admin", label: "Dashboard", reason: "Command center overview." },
      ],
    },
  ]);

  async function sendPrompt(prompt: string) {
    const message = prompt.trim();
    if (!message || busy) return;

    setBusy(true);
    setMessages((current) => [...current, { role: "user", text: message }]);
    setInput("");

    try {
      const response = await fetch("/api/owner/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message }),
      });
      
      const data = (await response.json().catch(() => ({}))) as {
        answer?: string;
        error?: string;
        routes?: OperatorMessage["routes"];
        highlights?: string[];
      };
      
      const nextMessage =
        response.ok && data.answer
          ? {
              role: "assistant" as const,
              text: data.answer,
              routes: data.routes,
              highlights: data.highlights,
            }
          : data.error === "rate_limited"
            ? {
                role: "assistant" as const,
                text: "The operator is rate limited. Try again shortly.",
              }
            : {
                role: "assistant" as const,
                text: "The operator route is not available right now.",
              };
      setMessages((current) => [...current, nextMessage]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: "The operator request did not complete.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed right-4 bottom-4 z-50">
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="AI Operator"
          className="surface-panel w-[22rem] rounded-[1.6rem] p-4 shadow-2xl shadow-rose-950/30"
        >
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-300">Operator Copilot</p>
              <p className="mt-1 text-sm text-slate-300">Analyze and operate the foundry.</p>
            </div>
            <button
              type="button"
              aria-label="Close AI operator"
              onClick={() => setOpen(false)}
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div aria-live="polite" className="max-h-72 space-y-3 overflow-y-auto pr-1">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${
                  message.role === "assistant"
                    ? "border-rose-400/20 bg-rose-500/10 text-slate-100"
                    : "border-white/10 bg-white/[0.04] text-slate-300"
                }`}
              >
                {message.text}
                {message.highlights && message.highlights.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.highlights.slice(0, 3).map((highlight) => (
                      <span
                        key={highlight}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.18em] text-slate-300"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                ) : null}
                {message.routes && message.routes.length > 0 ? (
                  <div className="mt-3 grid gap-2">
                    {message.routes.map((route) => (
                      <Link
                        key={`${route.href}-${route.label}`}
                        href={route.href}
                        className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-200 hover:border-rose-300/30 hover:text-white"
                      >
                        <span className="block font-semibold uppercase tracking-[0.24em] text-rose-200">
                          {route.label}
                        </span>
                        <span className="mt-1 block text-slate-400">{route.reason}</span>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void sendPrompt(input);
            }}
            className="mt-4 grid gap-3"
          >
            <label className="sr-only" htmlFor="ai-operator-input">
              Ask the Operator
            </label>
            <textarea
              id="ai-operator-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about health, moderation, or repository status."
              className="min-h-24 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-rose-400/40"
            />
            <button type="submit" disabled={busy} className="action-primary w-full justify-center text-xs border-rose-500/50 bg-rose-600/20 hover:bg-rose-600/30 text-rose-100">
              {busy ? "Analyzing…" : "Send to operator"}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void sendPrompt(prompt)}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300 hover:border-rose-400/30 hover:text-white"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label="Open AI Operator"
          onClick={() => setOpen(true)}
          className="surface-panel flex items-center gap-3 rounded-full px-4 py-3 text-left border-rose-500/20 bg-rose-950/20"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-sm font-bold uppercase tracking-[0.2em] text-white">
            OP
          </span>
          <span>
            <span className="block text-xs uppercase tracking-[0.26em] text-rose-300">Operator</span>
            <span className="display-title block text-sm font-semibold tracking-[-0.03em] text-white">
              Command copilot
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
