import { formatCurrency } from "@/lib/utils";

interface HourlySalesChartProps {
  hourlyRevenue: { hour: number; revenue: number; orders: number }[];
}

function formatHourLabel(hour: number): string {
  const period = hour < 12 ? "am" : "pm";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}${period}`;
}

/** Lightweight CSS bar chart — avoids pulling in a charting library for one small widget. */
export function HourlySalesChart({ hourlyRevenue }: HourlySalesChartProps) {
  if (hourlyRevenue.length === 0) {
    return <p className="py-8 text-center text-sm text-ink/40">No sales recorded yet today.</p>;
  }

  const maxRevenue = Math.max(...hourlyRevenue.map((h) => h.revenue), 1);

  return (
    <div className="flex items-end gap-2 overflow-x-auto pt-4">
      {hourlyRevenue.map((h) => (
        <div key={h.hour} className="flex min-w-[2.75rem] flex-1 flex-col items-center gap-1.5">
          <span className="text-[11px] font-medium text-ink/50">{formatCurrency(h.revenue)}</span>
          <div className="flex h-28 w-full items-end rounded-md bg-cream-soft">
            <div
              className="w-full rounded-md bg-primary"
              style={{ height: `${Math.max((h.revenue / maxRevenue) * 100, 4)}%` }}
            />
          </div>
          <span className="text-[11px] text-ink/40">{formatHourLabel(h.hour)}</span>
        </div>
      ))}
    </div>
  );
}
