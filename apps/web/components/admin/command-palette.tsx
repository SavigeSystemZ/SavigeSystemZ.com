"use client";

import { CommandPaletteRow, StatusChip } from "@savige/ui";
import { useEffect, useMemo, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRouter } from "next/navigation";

type PaletteAction = {
  id: string;
  title: string;
  description: string;
  href: string;
  keywords: string[];
};

const PALETTE_ACTIONS: PaletteAction[] = [
  {
    id: "open-admin-overview",
    title: "Open admin overview",
    description: "Return to owner overview and readiness cards.",
    href: "/admin",
    keywords: ["overview", "home", "admin"],
  },
  {
    id: "open-applications",
    title: "Open applications",
    description: "Manage catalog entries, launch readiness, and publish status.",
    href: "/admin",
    keywords: ["applications", "catalog", "publish"],
  },
  {
    id: "open-code",
    title: "Open code module",
    description: "Manage tracked repositories, visibility, and sync state.",
    href: "/admin/code",
    keywords: ["code", "repo", "github", "sync"],
  },
  {
    id: "open-releases",
    title: "Open releases",
    description: "Create versions and manage downloadable artifacts.",
    href: "/admin/releases",
    keywords: ["release", "artifact", "version"],
  },
  {
    id: "open-moderation",
    title: "Open moderation queue",
    description: "Review creator submissions and promotion actions.",
    href: "/admin/moderation",
    keywords: ["moderation", "creator", "queue"],
  },
  {
    id: "open-audit",
    title: "Open audit logs",
    description: "Inspect privileged action history and mutation records.",
    href: "/admin/audit",
    keywords: ["audit", "logs", "history"],
  },
  {
    id: "open-vault",
    title: "Open vault",
    description: "Inspect encrypted owner-only artifact storage.",
    href: "/admin/vault",
    keywords: ["vault", "encrypted", "artifacts"],
  },
];

function scoreAction(action: PaletteAction, query: string): number {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return 0;
  const title = action.title.toLowerCase();
  const description = action.description.toLowerCase();
  if (title.startsWith(normalized)) return 100;
  if (title.includes(normalized)) return 80;
  if (description.includes(normalized)) return 60;
  if (action.keywords.some((keyword) => keyword.includes(normalized))) return 40;
  return -1;
}

export function AdminCommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const candidates = PALETTE_ACTIONS.map((action) => ({
      action,
      score: scoreAction(action, normalized),
    }))
      .filter((entry) => normalized.length === 0 || entry.score >= 0)
      .sort((a, b) => b.score - a.score);
    return candidates.map((entry) => entry.action);
  }, [query]);

  function openPalette() {
    setOpen(true);
    setActiveIndex(0);
  }

  function closePalette() {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }

  function runAction(action: PaletteAction) {
    router.push(action.href);
    closePalette();
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (filtered.length === 0 ? 0 : (index + 1) % filtered.length));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (filtered.length === 0 ? 0 : (index - 1 + filtered.length) % filtered.length));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const action = filtered[activeIndex];
      if (action) runAction(action);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closePalette();
    }
  }

  useEffect(() => {
    function onGlobalKeyDown(event: KeyboardEvent) {
      const isModifier = event.metaKey || event.ctrlKey;
      if (isModifier && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((currentlyOpen) => {
          if (currentlyOpen) {
            setQuery("");
            setActiveIndex(0);
            return false;
          }
          setActiveIndex(0);
          return true;
        });
        return;
      }
      if (event.key === "Escape" && open) {
        event.preventDefault();
        setOpen(false);
        setQuery("");
        setActiveIndex(0);
      }
    }

    window.addEventListener("keydown", onGlobalKeyDown);
    return () => window.removeEventListener("keydown", onGlobalKeyDown);
  }, [open]);

  return (
    <>
      <button type="button" onClick={openPalette} className="action-secondary text-xs" aria-label="Open command palette">
        Command palette
        <StatusChip className="ml-2 text-[0.62rem] uppercase tracking-[0.16em]">Cmd/Ctrl+K</StatusChip>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="mx-auto mt-20 w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl">
            <input
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Search commands (releases, code, moderation, audit...)"
              className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/40"
              aria-label="Command palette search"
            />
            <div className="mt-3 space-y-2">
              {filtered.length === 0 ? (
                <p className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-slate-400">
                  No matching commands.
                </p>
              ) : (
                filtered.map((action, index) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => runAction(action)}
                    className={`block w-full text-left ${
                      index === activeIndex ? "ring-1 ring-cyan-300/35" : ""
                    } rounded-xl`}
                  >
                    <CommandPaletteRow
                      title={action.title}
                      description={action.description}
                      shortcut={index === activeIndex ? "Enter" : undefined}
                    />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
