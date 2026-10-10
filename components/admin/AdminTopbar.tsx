"use client";

import { MapPin, Menu, Search } from "lucide-react";

interface AdminTopbarProps {
  title: string;
  isConnected?: boolean;
  onMenuClick?: () => void;
}

/** Admin's name/email/avatar/logout now live at the bottom of the sidebar (AdminSidebar) instead of here. */
export function AdminTopbar({ title, isConnected, onMenuClick }: AdminTopbarProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-white px-4 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="-ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink/60 hover:bg-cream-soft hover:text-ink lg:hidden"
        >
          <Menu className="h-5 w-5" strokeWidth={2} />
        </button>
        <h1 className="truncate text-lg font-semibold text-ink">{title}</h1>
        {isConnected !== undefined && (
          <span className="flex shrink-0 items-center gap-1.5 text-xs text-ink/50">
            <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-accent" : "bg-ink/20"}`} />
            {isConnected ? "Live" : "Reconnecting..."}
          </span>
        )}
      </div>

      <div className="hidden min-w-0 flex-1 items-center justify-center gap-4 lg:flex">
        <span className="flex items-center gap-1.5 rounded-full border border-border bg-cream-soft px-3 py-1.5 text-xs font-medium text-ink/70">
          <MapPin className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
          Garden Cafe
        </span>
        <label className="relative flex max-w-xs flex-1 items-center">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-ink/30" strokeWidth={2} />
          <input
            type="search"
            placeholder="Search orders, tables, items..."
            className="w-full rounded-full border border-border bg-cream-soft py-1.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink/30 focus:border-primary focus:outline-none"
          />
        </label>
      </div>
    </header>
  );
}
