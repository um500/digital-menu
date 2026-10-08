import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { ReportSummaryView } from "@/types/report";

const METHOD_LABELS: Record<string, string> = {
  online: "Online",
  cash: "Cash",
  card: "Card",
  manual: "Manual (demo)",
};

export function PaymentBreakdownTable({ report }: { report: ReportSummaryView }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-display text-sm font-semibold text-ink">By payment method</h2>
      </CardHeader>
      <CardBody>
        {report.paymentBreakdown.length === 0 ? (
          <p className="text-sm text-ink/40">No orders in this range.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-ink/50">
                <th className="pb-2 font-medium">Method</th>
                <th className="pb-2 font-medium">Orders</th>
                <th className="pb-2 text-right font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {report.paymentBreakdown.map((row) => (
                <tr key={row.method}>
                  <td className="py-2 text-ink">{METHOD_LABELS[row.method] ?? row.method}</td>
                  <td className="py-2 text-ink/60">{row.count}</td>
                  <td className="py-2 text-right text-ink/60">{formatCurrency(row.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardBody>
    </Card>
  );
}
