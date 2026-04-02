"use client";

import { useState } from "react";

export function AiDock() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed right-4 bottom-4 z-50">
      {open ? (
        <div className="w-80 rounded-xl border border-zinc-700 bg-zinc-950 p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-cyan-300">AI Concierge</p>
            <button onClick={() => setOpen(false)} className="text-xs text-zinc-400">
              Close
            </button>
          </div>
          <p className="text-xs text-zinc-400">Streaming chat scaffold. Retrieval wiring in milestone M4.</p>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-zinc-950"
        >
          AI Concierge
        </button>
      )}
    </div>
  );
}
