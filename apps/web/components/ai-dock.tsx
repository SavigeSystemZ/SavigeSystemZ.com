"use client";

import Link from "next/link";
import { useState } from "react";

type ConciergeMessage = {
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
  "Show me the flagship apps",
  "I need a custom build",
  "Show me Linux builds, configs, and archive work",
  "What can I download here?",
];

export function AiDock() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ConciergeMessage[]>([
    {
      role: "assistant",
      text: "I can route people across the live catalog, archive, downloads, pricing, creator intake, and custom build lanes.",
      routes: [
        { href: "/applications", label: "Applications", reason: "Flagship app catalog." },
        { href: "/archive", label: "Archive", reason: "Linux builds, configs, research, and model work." },
        { href: "/services", label: "Request project", reason: "Scoped build intake." },
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
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        answer?: string;
        error?: string;
        routes?: ConciergeMessage["routes"];
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
                text: "The concierge is rate limited for a moment. Use the quick routes below and try again shortly.",
              }
            : {
                role: "assistant" as const,
                text: "The concierge route is not available right now. Use the quick routes below.",
              };
      setMessages((current) => [...current, nextMessage]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: "The concierge request did not complete. Use the quick routes below while the live path reconnects.",
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
          aria-label="AI concierge"
          className="surface-panel w-[22rem] rounded-[1.6rem] p-4 shadow-2xl shadow-cyan-950/30"
        >
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/70">AI Concierge</p>
              <p className="mt-1 text-sm text-slate-300">Route visitors into the right surface.</p>
            </div>
            <button
              type="button"
              aria-label="Close AI concierge"
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
                    ? "border-cyan-400/20 bg-cyan-400/8 text-slate-100"
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
                        className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-200 hover:border-cyan-300/30 hover:text-white"
                      >
                        <span className="block font-semibold uppercase tracking-[0.24em] text-cyan-100/70">
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
            <label className="sr-only" htmlFor="ai-concierge-input">
              Ask the AI concierge
            </label>
            <textarea
              id="ai-concierge-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about apps, releases, pricing, or project work."
              className="min-h-24 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/40"
            />
            <button type="submit" disabled={busy} className="action-primary w-full justify-center text-xs">
              {busy ? "Routing request…" : "Send to concierge"}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void sendPrompt(prompt)}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300 hover:border-cyan-300/30 hover:text-white"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-2 text-sm text-slate-400">
            <Link href="/applications" className="hover:text-white">
              Explore the application catalog
            </Link>
            <Link href="/archive" className="hover:text-white">
              Browse the engineering archive
            </Link>
            <Link href="/pricing" className="hover:text-white">
              Review pricing modes
            </Link>
            <Link href="/services" className="hover:text-white">
              Submit a project request
            </Link>
          </div>
        </div>
      ) : (
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label="Open AI concierge"
          onClick={() => setOpen(true)}
          className="surface-panel flex items-center gap-3 rounded-full px-4 py-3 text-left"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400 text-sm font-bold uppercase tracking-[0.2em] text-slate-950">
            AI
          </span>
          <span>
            <span className="block text-xs uppercase tracking-[0.26em] text-cyan-100/70">Concierge</span>
            <span className="display-title block text-sm font-semibold tracking-[-0.03em] text-white">
              Find the right route
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
