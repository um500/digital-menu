"use client";

import { useState } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { GstSalesRegister } from "@/components/admin/reports/GstSalesRegister";
import { PaymentBreakdownTable } from "@/components/admin/reports/PaymentBreakdownTable";
import { RecentFeedback } from "@/components/admin/reports/RecentFeedback";
import { ReportDateFilter } from "@/components/admin/reports/ReportDateFilter";
import { ReportSummaryCards } from "@/components/admin/reports/ReportSummaryCards";
import { RevenueByTable } from "@/components/admin/reports/RevenueByTable";
import { RevenueTrendChart } from "@/components/admin/reports/RevenueTrendChart";
import { TopItemsTable } from "@/components/admin/reports/TopItemsTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loading } from "@/components/shared/Loading";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { useReport } from "@/hooks/use-report";

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function ReportsPage() {
  const today = todayIsoDate();
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);

  const { report, isLoading, error, mutate } = useReport(from, to);
  const { settings } = usePublicSettings();

  return (
    <AdminShell title="Reports">
      <div className="space-y-4 p-4">
        <ReportDateFilter
          from={from}
          to={to}
          onChange={(nextFrom, nextTo) => {
            setFrom(nextFrom);
            setTo(nextTo);
          }}
        />

        {isLoading && <Loading label="Loading report..." />}
        {error && <ErrorState message="Could not load the report." onRetry={() => mutate()} />}

        {report && (
          <>
            <ReportSummaryCards report={report} />
            <RevenueTrendChart report={report} />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <TopItemsTable report={report} />
              <RevenueByTable report={report} />
              <PaymentBreakdownTable report={report} />
              <RecentFeedback report={report} />
            </div>
            <GstSalesRegister
              report={report}
              restaurantName={settings?.restaurantName ?? "Garden Cafe"}
              gstNumber={settings?.gstNumber}
            />
          </>
        )}
      </div>
    </AdminShell>
  );
}
