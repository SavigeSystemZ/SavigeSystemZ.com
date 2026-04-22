import type { ReactNode } from "react";

type PanelProps = {
  children: ReactNode;
  className?: string;
};

export function Panel({ children, className }: PanelProps): ReactNode {
  return <div className={`surface-panel ${className ?? ""}`.trim()}>{children}</div>;
}
