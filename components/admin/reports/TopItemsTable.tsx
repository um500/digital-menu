import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { ReportSummaryView } from "@/types/report";

export function TopItemsTable({ report }: { report: ReportSummaryView }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-display text-sm font-semibold text-ink">Best-selling items</h2>
      </CardHeader>
      <CardBody>
        {report.topItems.length === 0 ? (
          <p className="text-sm text-ink/40">No orders in this range.</p>
        ) : (
          <ul className="divide-y divide-border">
            {report.topItems.map((item, i) => (
              <li key={item.name} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-semibold text-primary">
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
        )}
      </CardBody>
    </Card>
  );
}
