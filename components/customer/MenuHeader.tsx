"use client";

import { Search } from "lucide-react";

import { GardenCafeLogo } from "@/components/shared/GardenCafeLogo";

interface MenuHeaderProps {
  restaurantName: string;
  tableLabel?: string | null;
  search: string;
  onSearchChange: (value: string) => void;
}

export function MenuHeader({ tableLabel, search, onSearchChange }: MenuHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-cream/95 px-4 py-3 backdrop-blur">
      <div className="flex items-center justify-between">
        <GardenCafeLogo size="sm" showTagline={false} />
        {tableLabel && (
          <span className="rounded-full bg-cream-soft px-2.5 py-1 text-xs font-medium text-ink/60">
            {tableLabel}
          </span>
        )}
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
