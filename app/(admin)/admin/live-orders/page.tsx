"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { LiveOrderBoard } from "@/components/admin/live-orders/LiveOrderBoard";
import { LiveOrderStats } from "@/components/admin/live-orders/LiveOrderStats";
import { HourlySalesChart } from "@/components/admin/live-orders/HourlySalesChart";
import { QuickActionsPanel } from "@/components/admin/live-orders/QuickActionsPanel";
import { TopItemsToday } from "@/components/admin/live-orders/TopItemsToday";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { useRealtimeOrders } from "@/hooks/use-realtime-orders";
import { useReport } from "@/hooks/use-report";
import { useTables } from "@/hooks/use-tables";

export default function LiveOrdersPage() {
  const { orders, isLoading, isConnected } = useRealtimeOrders("/api/orders/stream");
  const { report } = useReport();
  const { tables } = useTables();

  const activeTables = tables.filter((t) => t.status !== "empty").length;

  return (
    <AdminShell title="Live Orders" isConnected={isConnected}>
      <div className="space-y-4 p-4">
        <LiveOrderStats report={report} activeTables={activeTables} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
          <Card className="min-h-[24rem]">
            {isLoading ? (
              <Loading label="Loading live orders..." />
            ) : (
              <LiveOrderBoard orders={orders} />
            )}
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <h3 className="font-display text-sm font-semibold text-ink">Quick Actions</h3>
              </CardHeader>
              <CardBody>
                <QuickActionsPanel />
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-display text-sm font-semibold text-ink">Hourly Sales</h3>
              </CardHeader>
              <CardBody>
                <HourlySalesChart hourlyRevenue={report?.hourlyRevenue ?? []} />
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-display text-sm font-semibold text-ink">Top 3 Items Today</h3>
              </CardHeader>
              <CardBody>
                <TopItemsToday topItems={report?.topItems ?? []} />
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
