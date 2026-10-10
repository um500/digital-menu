"use client";

import { ALLERGENS } from "@/lib/constants/allergens";
import { cn } from "@/lib/utils";

interface AllergenFilterBarProps {
  excluded: string[];
  onChange: (excluded: string[]) => void;
}

/** "Hide anything with..." — lets a customer filter out dishes tagged with an allergen they need to avoid. */
export function AllergenFilterBar({ excluded, onChange }: AllergenFilterBarProps) {
  function toggle(value: string) {
    onChange(excluded.includes(value) ? excluded.filter((v) => v !== value) : [...excluded, value]);
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto border-b border-border bg-cream px-4 py-2">
      <span className="shrink-0 text-xs text-ink/40">Hide:</span>
      {ALLERGENS.map((a) => (
        <button
          key={a.value}
          type="button"
          onClick={() => toggle(a.value)}
          className={cn(
            "shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
            excluded.includes(a.value)
              ? "border-red-300 bg-red-50 text-red-700"
              : "border-border bg-white text-ink/50 hover:bg-cream-soft"
          )}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
