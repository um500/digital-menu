import type { ReactNode } from "react";

// Login page intentionally has no shared chrome (sidebar/topbar) — it's the
// one admin page a signed-out user can reach. Pages past it render their own
// AdminSidebar/AdminTopbar so this layout stays a thin pass-through.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-cream">{children}</div>;
}
