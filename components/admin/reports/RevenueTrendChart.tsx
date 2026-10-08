import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { ReportSummaryView } from "@/types/report";

function formatDateLabel(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function RevenueTrendChart({ report }: { report: ReportSummaryView }) {
  const { dailyRevenue } = report;

  return (
    <Card>
      <CardHeader>
        <h2 className="font-display text-sm font-semibold text-ink">Revenue Trend</h2>
      </CardHeader>
      <CardBody>
        {dailyRevenue.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink/40">No sales recorded in this range.</p>
        ) : (
          <div className="flex items-end gap-2 overflow-x-auto pt-2">
            {dailyRevenue.map((d) => {
              const maxRevenue = Math.max(...dailyRevenue.map((x) => x.revenue), 1);
              return (
                <div key={d.date} className="flex min-w-[3.25rem] flex-1 flex-col items-center gap-1.5">
                  <span className="text-[11px] font-medium text-ink/50">{formatCurrency(d.revenue)}</span>
                  <div className="flex h-32 w-full items-end rounded-md bg-cream-soft">
                    <div
                      className="w-full rounded-md bg-primary"
                      style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, 4)}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-ink/40">{formatDateLabel(d.date)}</span>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
