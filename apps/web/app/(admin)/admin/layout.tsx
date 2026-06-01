import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { OperatorDock } from "@/components/admin/operator-dock";

export const metadata: Metadata = {
  title: {
    template: "%s · Owner",
    default: "Admin",
  },
  robots: { index: false, follow: false },
};

export default function AdminSectionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(29,213,242,0.14),transparent_24%),radial-gradient(circle_at_top_right,rgba(249,188,97,0.12),transparent_20%),linear-gradient(180deg,#08111b_0%,#040912_44%,#02050a_100%)]">
      <AdminShell />
      <div
        id="main-content"
        tabIndex={-1}
        className="outline-none focus:outline-none"
      >
        {children}
      </div>
      <OperatorDock />
    </div>
  );
}
