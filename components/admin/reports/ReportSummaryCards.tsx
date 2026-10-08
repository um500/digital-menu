import { IndianRupee, Receipt, Star, Wallet } from "lucide-react";

import { StatCard } from "@/components/admin/StatCard";
import { formatCurrency } from "@/lib/utils";
import type { ReportSummaryView } from "@/types/report";

export function ReportSummaryCards({ report }: { report: ReportSummaryView }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Orders" value={report.totalOrders.toString()} icon={Receipt} tone="accent" />
      <StatCard label="Revenue" value={formatCurrency(report.totalRevenue)} icon={IndianRupee} tone="primary" />
      <StatCard
        label="Avg. order value"
        value={formatCurrency(Math.round(report.avgOrderValue))}
        icon={Wallet}
        tone="neutral"
      />
      <StatCard
        label="Avg. rating"
        value={report.avgRating != null ? `${report.avgRating} (${report.feedbackCount})` : "—"}
        icon={Star}
        tone="warning"
      />
    </div>
  );
}
