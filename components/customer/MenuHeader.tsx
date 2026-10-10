"use client";

import { History, Search } from "lucide-react";
import Link from "next/link";

import { GardenCafeLogo } from "@/components/shared/GardenCafeLogo";
import { TableWaiterCallButton } from "@/components/customer/TableWaiterCallButton";

interface MenuHeaderProps {
  restaurantName: string;
  tableId: string | null;
  tableLabel?: string | null;
  customerName?: string | null;
  search: string;
  onSearchChange: (value: string) => void;
}

export function MenuHeader({ tableId, tableLabel, customerName, search, onSearchChange }: MenuHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-cream/95 px-4 py-3 backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <GardenCafeLogo size="sm" showTagline={false} />
          {customerName && <p className="mt-0.5 truncate text-xs text-ink/40">Hi {customerName}!</p>}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {tableLabel && (
            <span className="rounded-full bg-cream-soft px-2.5 py-1 text-xs font-medium text-ink/60">
              {tableLabel}
            </span>
          )}
          <Link
            href="/orders"
            aria-label="Order history"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-ink/60 hover:bg-cream-soft"
          >
            <History className="h-4 w-4" strokeWidth={2} />
          </Link>
          <TableWaiterCallButton tableId={tableId} />
        </div>
      </div>

      <label className="relative mt-3 flex items-center">
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-ink/30" strokeWidth={2} />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search dishes..."
          className="w-full rounded-full border border-border bg-white py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink/30 focus:border-primary focus:outline-none"
        />
      </label>
    </header>
  );
}
