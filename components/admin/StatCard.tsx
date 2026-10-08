import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Tone = "primary" | "accent" | "neutral" | "warning";

const toneClasses: Record<Tone, string> = {
  primary: "bg-primary-light text-primary",
  accent: "bg-accent-light text-accent-dark",
  neutral: "bg-cream-soft text-ink/60",
  warning: "bg-amber-100 text-amber-700",
};

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: Tone;
  hint?: string;
}

/** Shared stat tile used across the Live Orders, Reports and Inventory dashboards. */
export function StatCard({ label, value, icon: Icon, tone = "primary", hint }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink/50">{label}</span>
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-full", toneClasses[tone])}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>
      <div className="font-display mt-2 text-2xl font-semibold text-ink">{value}</div>
      {hint && <div className="mt-1 text-xs text-ink/40">{hint}</div>}
    </div>
  );
}
