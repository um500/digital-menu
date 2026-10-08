"use client";

import { useState, type ReactNode } from "react";

import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { WaiterCallToasts } from "./WaiterCallToasts";

/**
 * Shared chrome for every admin page past login: dark sidebar + topbar.
 * Below the `lg` breakpoint the sidebar becomes a slide-in drawer, opened
 * from the topbar's hamburger button — admin is mainly used from a counter
 * tablet/desktop, but this keeps it usable on a phone too.
 */
export function AdminShell({
  title,
  isConnected,
  children,
}: {
  title: string;
  isConnected?: boolean;
  children: ReactNode;
}) {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-cream">
      <AdminSidebar open={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar title={title} isConnected={isConnected} onMenuClick={() => setIsNavOpen(true)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <WaiterCallToasts />
    </div>
  );
}
