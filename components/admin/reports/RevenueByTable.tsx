import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { ReportSummaryView } from "@/types/report";

export function RevenueByTable({ report }: { report: ReportSummaryView }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-display text-sm font-semibold text-ink">Revenue by table</h2>
      </CardHeader>
      <CardBody>
        {report.revenueByTable.length === 0 ? (
          <p className="text-sm text-ink/40">No orders in this range.</p>
        ) : (
          <ul className="divide-y divide-border">
            {report.revenueByTable.map((row) => (
              <li key={row.tableLabel} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                <div>
                  <div className="text-sm font-medium text-ink">{row.tableLabel}</div>
                  <div className="text-xs text-ink/40">{row.orders} orders</div>
                </div>
                <span className="text-sm font-semibold text-ink">{formatCurrency(row.revenue)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
