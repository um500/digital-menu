"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn, formatCurrency } from "@/lib/utils";
import type { InventoryRowView } from "@/types/inventory";

function StockLevelBar({ quantity, threshold, isOut, isLow }: { quantity: number; threshold: number; isOut: boolean; isLow: boolean }) {
  // A rough visual ceiling — twice the low-stock threshold (or 20 as a floor
  // for items with threshold 0) — so the bar has a stable scale as the
  // quantity changes, without needing a separate "max stock" field.
  const ceiling = Math.max(threshold * 2, 20, quantity);
  const pct = Math.min(100, Math.max(0, (quantity / ceiling) * 100));
  const barColor = isOut ? "bg-red-400" : isLow ? "bg-amber-400" : "bg-accent";

  return (
    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-cream-soft">
      <div className={cn("h-full rounded-full", barColor)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function InventoryRow({ row, onSaved }: { row: InventoryRowView; onSaved: () => void }) {
  const [trackStock, setTrackStock] = useState(row.trackStock);
  const [stockQuantity, setStockQuantity] = useState(row.stockQuantity);
  const [lowStockThreshold, setLowStockThreshold] = useState(row.lowStockThreshold);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty =
    trackStock !== row.trackStock ||
    stockQuantity !== row.stockQuantity ||
    lowStockThreshold !== row.lowStockThreshold;

  const isLow = trackStock && stockQuantity <= lowStockThreshold;
  const isOut = trackStock && stockQuantity <= 0;

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/inventory/${row.menuItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuItemName: row.menuItemName,
          trackStock,
          stockQuantity,
          lowStockThreshold,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-2.5 pr-3">
        <div className="text-sm font-medium text-ink">{row.menuItemName}</div>
        <div className="text-xs text-ink/40">
          {row.categoryName} · {formatCurrency(row.price)}
        </div>
      </td>
      <td className="py-2.5 pr-3">
        <Switch checked={trackStock} onChange={setTrackStock} label="" />
      </td>
      <td className="py-2.5 pr-3">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            value={stockQuantity}
            onChange={(e) => setStockQuantity(Number(e.target.value))}
            disabled={!trackStock}
            className="w-20"
          />
          {trackStock && (
            <StockLevelBar quantity={stockQuantity} threshold={lowStockThreshold} isOut={isOut} isLow={isLow} />
          )}
        </div>
      </td>
      <td className="py-2.5 pr-3">
        <Input
          type="number"
          min={0}
          value={lowStockThreshold}
          onChange={(e) => setLowStockThreshold(Number(e.target.value))}
          disabled={!trackStock}
          className="w-20"
        />
      </td>
      <td className="py-2.5 pr-3">
        {isOut ? (
          <Badge tone="danger">Out</Badge>
        ) : isLow ? (
          <Badge tone="warning">Low</Badge>
        ) : trackStock ? (
          <Badge tone="success">OK</Badge>
        ) : (
          <Badge tone="neutral">Not tracked</Badge>
        )}
      </td>
      <td className="py-2.5">
        <Button size="sm" variant="secondary" isLoading={isSaving} disabled={!isDirty} onClick={handleSave}>
          Save
        </Button>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </td>
    </tr>
  );
}
