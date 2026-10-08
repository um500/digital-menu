"use client";

import { Leaf } from "lucide-react";

import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  categories: { _id: string; name: string }[];
  activeId: string | null;
  onSelect: (id: string) => void;
  vegOnly: boolean;
  onToggleVegOnly: (value: boolean) => void;
}

export function CategoryTabs({ categories, activeId, onSelect, vegOnly, onToggleVegOnly }: CategoryTabsProps) {
  return (
    <div className="sticky top-[97px] z-10 flex gap-2 overflow-x-auto border-b border-border bg-cream px-4 py-2">
      <button
        type="button"
        onClick={() => onToggleVegOnly(!vegOnly)}
        className={cn(
          "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
          vegOnly
            ? "border-accent bg-accent-light text-accent-dark"
            : "border-border bg-white text-ink/60 hover:bg-cream-soft"
        )}
      >
        <Leaf className="h-3.5 w-3.5" strokeWidth={2} />
        Veg only
      </button>

      {categories.map((cat) => (
        <button
          key={cat._id}
          onClick={() => onSelect(cat._id)}
          className={cn(
            "whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
            activeId === cat._id
              ? "bg-primary text-white"
              : "bg-white text-ink/60 hover:bg-cream-soft"
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
