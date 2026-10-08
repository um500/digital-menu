"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { InventoryRow } from "@/components/admin/inventory/InventoryRow";
import { InventoryStats } from "@/components/admin/inventory/InventoryStats";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loading } from "@/components/shared/Loading";
import { useInventory } from "@/hooks/use-inventory";
import { cn } from "@/lib/utils";
import type { InventoryRowView } from "@/types/inventory";

type SortKey = "name" | "stock";
type SortDir = "asc" | "desc";

function SortableHeader({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey | null;
  dir: SortDir;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const isActive = activeKey === sortKey;
  const Icon = isActive ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <th className={cn("pb-2 font-medium", className)}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn("flex items-center gap-1 hover:text-ink", isActive && "text-ink")}
      >
        {label}
        <Icon className="h-3 w-3" strokeWidth={2} />
      </button>
    </th>
  );
}

export default function InventoryPage() {
  const { rows, isLoading, error, mutate } = useInventory();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const visibleRows = useMemo(() => {
    let next: InventoryRowView[] = rows;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      next = next.filter(
        (r) => r.menuItemName.toLowerCase().includes(q) || r.categoryName.toLowerCase().includes(q)
      );
    }

    if (sortKey) {
      next = [...next].sort((a, b) => {
        const cmp =
          sortKey === "name"
            ? a.menuItemName.localeCompare(b.menuItemName)
            : a.stockQuantity - b.stockQuantity;
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return next;
  }, [rows, search, sortKey, sortDir]);

  return (
    <AdminShell title="Inventory">
      <div className="space-y-4 p-4">
        <InventoryStats rows={rows} />

        <p className="text-sm text-ink/50">
          Stock tracking is opt-in per item — turn it on only for items you actually run out of.
          Untracked items are always orderable.
        </p>

        <label className="relative flex max-w-xs items-center">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-ink/30" strokeWidth={2} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items or categories..."
            className="w-full rounded-full border border-border bg-white py-1.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink/30 focus:border-primary focus:outline-none"
          />
        </label>

        {isLoading && <Loading label="Loading inventory..." />}
        {error && <ErrorState message="Could not load inventory." onRetry={() => mutate()} />}

        {!isLoading && !error && rows.length === 0 && (
          <p className="py-16 text-center text-sm text-ink/40">
            No menu items yet — add some in Sanity Studio first.
          </p>
        )}

        {!isLoading && !error && rows.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-border bg-white p-4 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ink/50">
                  <SortableHeader label="Item" sortKey="name" activeKey={sortKey} dir={sortDir} onSort={handleSort} className="pr-3" />
                  <th className="pb-2 pr-3 font-medium">Track</th>
                  <SortableHeader label="Stock" sortKey="stock" activeKey={sortKey} dir={sortDir} onSort={handleSort} className="pr-3" />
                  <th className="pb-2 pr-3 font-medium">Low at</th>
                  <th className="pb-2 pr-3 font-medium">Status</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <InventoryRow key={row.menuItemId} row={row} onSaved={() => mutate()} />
                ))}
              </tbody>
            </table>
            {visibleRows.length === 0 && (
              <p className="py-8 text-center text-sm text-ink/40">No items match &quot;{search}&quot;.</p>
            )}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
