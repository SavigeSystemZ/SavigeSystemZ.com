import type { Metadata } from "next";
import { OwnerShell } from "@/components/owner/owner-shell";

export const metadata: Metadata = {
  title: {
    template: "%s · Private Workspace",
    default: "Workspace",
  },
  robots: { index: false, follow: false },
};

export default function OwnerPrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.12),transparent_24%),radial-gradient(circle_at_top_right,rgba(249,188,97,0.1),transparent_20%),linear-gradient(180deg,#0a0508_0%,#050204_44%,#030102_100%)]">
      <OwnerShell />
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
