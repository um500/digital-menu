import { AlertTriangle, Package, PackageX, ShieldCheck } from "lucide-react";

import { StatCard } from "@/components/admin/StatCard";
import type { InventoryRowView } from "@/types/inventory";

export function InventoryStats({ rows }: { rows: InventoryRowView[] }) {
  const tracked = rows.filter((r) => r.trackStock);
  const low = tracked.filter((r) => r.stockQuantity > 0 && r.stockQuantity <= r.lowStockThreshold);
  const out = tracked.filter((r) => r.stockQuantity <= 0);

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard label="Total Items" value={String(rows.length)} icon={Package} tone="neutral" />
      <StatCard label="Tracked" value={String(tracked.length)} icon={ShieldCheck} tone="accent" />
      <StatCard label="Low Stock" value={String(low.length)} icon={AlertTriangle} tone="warning" />
      <StatCard label="Out of Stock" value={String(out.length)} icon={PackageX} tone="primary" />
    </div>
  );
}
