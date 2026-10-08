"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import type { OrderItemView } from "@/types/order";

type Mode = "equal" | "by-item";

interface SplitBillPanelProps {
  total: number;
  items: OrderItemView[];
}

/** Pure client-side calculator — no backend involved, payment itself is still settled manually at the table. */
export function SplitBillPanel({ total, items }: SplitBillPanelProps) {
  const [mode, setMode] = useState<Mode>("equal");
  const [people, setPeople] = useState(2);
  // One entry per unit (so a qty-3 item can be split across different
  // people) — index -> which person (1-based) owns that unit. Defaults
  // everything to person 1 until reassigned.
  const units = useMemo(
    () =>
      items.flatMap((item, itemIndex) =>
        Array.from({ length: item.quantity }, (_, unitIndex) => ({
          key: `${itemIndex}-${unitIndex}`,
          name: item.name,
          amount: item.price,
        }))
      ),
    [items]
  );
  const [assignments, setAssignments] = useState<Record<string, number>>({});

  const perPersonEqual = people > 0 ? Math.ceil(total / people) : total;

  const byItemTotals = useMemo(() => {
    const totals = Array.from({ length: people }, () => 0);
    for (const unit of units) {
      const person = assignments[unit.key] ?? 1;
      if (person >= 1 && person <= people) totals[person - 1] += unit.amount;
    }
    return totals;
  }, [units, assignments, people]);

  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-ink">Split the bill</h2>
        <div className="flex gap-1 rounded-full bg-cream-soft p-0.5">
          {(["equal", "by-item"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                mode === m ? "bg-primary text-white" : "text-ink/50 hover:text-ink"
              )}
            >
              {m === "equal" ? "Equal" : "By item"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label htmlFor="splitPeople" className="text-sm text-ink/50">
          Between
        </label>
        <Input
          id="splitPeople"
          type="number"
          min={1}
          max={20}
          value={people}
          onChange={(e) => setPeople(Math.max(1, Number(e.target.value) || 1))}
          className="w-20"
        />
        <span className="text-sm text-ink/50">people</span>
      </div>

      {mode === "equal" && people > 1 && (
        <p className="mt-2 text-sm text-ink/70">
          <strong className="text-ink">{formatCurrency(perPersonEqual)}</strong> per person (rounded up)
        </p>
      )}

      {mode === "by-item" && (
        <div className="mt-3 space-y-3">
          <ul className="divide-y divide-border">
            {units.map((unit) => (
              <li key={unit.key} className="flex items-center justify-between gap-2 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">{unit.name}</p>
                  <p className="text-xs text-ink/40">{formatCurrency(unit.amount)}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {Array.from({ length: people }, (_, i) => i + 1).map((person) => (
                    <button
                      key={person}
                      type="button"
                      onClick={() => setAssignments((prev) => ({ ...prev, [unit.key]: person }))}
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                        (assignments[unit.key] ?? 1) === person
                          ? "bg-primary text-white"
                          : "bg-cream-soft text-ink/50"
                      )}
                    >
                      {person}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>

          <div className="space-y-1 border-t border-border pt-2">
            {byItemTotals.map((amount, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-ink/60">Person {i + 1}</span>
                <span className="font-medium text-ink">{formatCurrency(amount)}</span>
              </div>
            ))}
            <p className="pt-1 text-xs text-ink/40">Tax & discounts are split equally regardless of assignment.</p>
          </div>
        </div>
      )}
    </div>
  );
}
