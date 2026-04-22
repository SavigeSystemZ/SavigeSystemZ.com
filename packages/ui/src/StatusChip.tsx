import type { ReactNode } from "react";

type StatusChipVariant = "info" | "success" | "warn" | "danger";

const VARIANT_CLASS: Record<StatusChipVariant, string> = {
  info: "text-cyan-100 border-cyan-300/30 bg-cyan-400/10",
  success: "text-emerald-100 border-emerald-300/30 bg-emerald-400/10",
  warn: "text-amber-100 border-amber-300/30 bg-amber-400/10",
  danger: "text-rose-100 border-rose-300/30 bg-rose-400/10",
};

type StatusChipProps = {
  children: ReactNode;
  variant?: StatusChipVariant;
  className?: string;
};

export function StatusChip({ children, variant = "info", className }: StatusChipProps): ReactNode {
  return (
    <span className={`signal-chip border ${VARIANT_CLASS[variant]} ${className ?? ""}`.trim()}>
      {children}
    </span>
  );
}
