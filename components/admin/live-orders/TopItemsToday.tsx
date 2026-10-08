import { formatCurrency } from "@/lib/utils";

interface TopItemsTodayProps {
  topItems: { name: string; quantity: number; revenue: number }[];
}

export function TopItemsToday({ topItems }: TopItemsTodayProps) {
  const top3 = topItems.slice(0, 3);

  if (top3.length === 0) {
    return <p className="py-6 text-center text-sm text-ink/40">No items sold yet today.</p>;
  }

  return (
    <ul className="space-y-3">
      {top3.map((item, i) => (
        <li key={item.name} className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-semibold text-primary">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-ink">{item.name}</div>
            <div className="text-xs text-ink/40">{item.quantity} sold</div>
          </div>
          <span className="shrink-0 text-sm font-semibold text-ink">{formatCurrency(item.revenue)}</span>
        </li>
      ))}
    </ul>
  );
}
