import { IndianRupee, LayoutGrid, Receipt, Wallet } from "lucide-react";

import { StatCard } from "@/components/admin/StatCard";
import { formatCurrency } from "@/lib/utils";
import type { ReportSummaryView } from "@/types/report";

interface LiveOrderStatsProps {
  report: ReportSummaryView | null;
  activeTables: number;
}

export function LiveOrderStats({ report, activeTables }: LiveOrderStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        label="Today's Revenue"
        value={formatCurrency(report?.totalRevenue ?? 0)}
        icon={IndianRupee}
        tone="primary"
      />
      <StatCard
        label="Orders Today"
        value={String(report?.totalOrders ?? 0)}
        icon={Receipt}
        tone="accent"
      />
      <StatCard
        label="Avg Order Value"
        value={formatCurrency(report?.avgOrderValue ?? 0)}
        icon={Wallet}
        tone="neutral"
      />
      <StatCard label="Active Tables" value={String(activeTables)} icon={LayoutGrid} tone="warning" />
    </div>
  );
}
