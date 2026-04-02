import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";

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
    <div className="min-h-screen bg-zinc-950">
      <AdminShell />
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
