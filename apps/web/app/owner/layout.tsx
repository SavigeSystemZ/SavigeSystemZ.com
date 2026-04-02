import type { ReactNode } from "react";

export default function OwnerSectionLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div
        id="main-content"
        tabIndex={-1}
        className="outline-none focus:outline-none"
      >
        {children}
      </div>
    </div>
  );
}
