import type { ReactNode } from "react";

type CommandPaletteRowProps = {
  title: string;
  description: string;
  shortcut?: string;
  action?: ReactNode;
};

export function CommandPaletteRow({
  title,
  description,
  shortcut,
  action,
}: CommandPaletteRowProps): ReactNode {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="mt-1 text-xs leading-6 text-slate-300">{description}</p>
        </div>
        {shortcut ? (
          <kbd className="rounded-md border border-white/15 bg-slate-950/50 px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.16em] text-slate-400">
            {shortcut}
          </kbd>
        ) : null}
      </div>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
