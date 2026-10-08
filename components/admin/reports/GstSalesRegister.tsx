"use client";

import { Download, Printer } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { printBill } from "@/lib/orders/print-bill";
import { formatCurrency } from "@/lib/utils";
import type { ReportSummaryView } from "@/types/report";
import type { OrderView } from "@/types/order";

function toCsvRow(values: (string | number)[]): string {
  return values
    .map((v) => {
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    })
    .join(",");
}

export function GstSalesRegister({
  report,
  restaurantName,
  gstNumber,
}: {
  report: ReportSummaryView;
  restaurantName: string;
  gstNumber?: string;
}) {
  const [printingOrderId, setPrintingOrderId] = useState<string | null>(null);
  const [printError, setPrintError] = useState<string | null>(null);

  // A served (or otherwise past) order isn't on the Live Orders board
  // anymore, so this is the reprint path for it — fetch the full order
  // (the register row only carries totals, not line items) and reuse the
  // same bill layout BillPrintButton uses.
  async function handlePrintBill(orderId: string) {
    setPrintingOrderId(orderId);
    setPrintError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load order");
      printBill(data.order as OrderView, restaurantName, gstNumber);
    } catch (err) {
      setPrintError(err instanceof Error ? err.message : "Could not print bill");
    } finally {
      setPrintingOrderId(null);
    }
  }

  function handleExportCsv() {
    const header = ["Order #", "Date", "Subtotal", "CGST", "SGST", "Total", "Payment Method"];
    const rows = report.gstRegister.map((row) =>
      toCsvRow([
        row.orderNumber,
        new Date(row.date).toLocaleString("en-IN"),
        row.subtotal.toFixed(2),
        row.cgst.toFixed(2),
        row.sgst.toFixed(2),
        row.total.toFixed(2),
        row.paymentMethod,
      ])
    );
    const csv = [toCsvRow(header), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gst-sales-register-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-ink">GST Sales Register</h2>
        <Button variant="secondary" size="sm" disabled={report.gstRegister.length === 0} onClick={handleExportCsv}>
          <Download className="h-3.5 w-3.5" strokeWidth={2} />
          Export CSV
        </Button>
      </CardHeader>
      <CardBody>
        {printError && <p className="mb-2 text-sm text-red-600">{printError}</p>}
        {report.gstRegister.length === 0 ? (
          <p className="text-sm text-ink/40">No orders in this range.</p>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="text-left text-xs text-ink/50">
                  <th className="pb-2 font-medium">Order #</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 text-right font-medium">Subtotal</th>
                  <th className="pb-2 text-right font-medium">CGST</th>
                  <th className="pb-2 text-right font-medium">SGST</th>
                  <th className="pb-2 text-right font-medium">Total</th>
                  <th className="pb-2 text-right font-medium">Bill</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {report.gstRegister.map((row) => (
                  <tr key={row.orderId}>
                    <td className="py-2 text-ink">#{row.orderNumber}</td>
                    <td className="py-2 text-ink/60">
                      {new Date(row.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </td>
                    <td className="py-2 text-right text-ink/60">{formatCurrency(row.subtotal)}</td>
                    <td className="py-2 text-right text-ink/60">{formatCurrency(row.cgst)}</td>
                    <td className="py-2 text-right text-ink/60">{formatCurrency(row.sgst)}</td>
                    <td className="py-2 text-right font-medium text-ink">{formatCurrency(row.total)}</td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        aria-label={`Print bill for order ${row.orderNumber}`}
                        disabled={printingOrderId === row.orderId}
                        onClick={() => handlePrintBill(row.orderId)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-ink/50 hover:bg-cream-soft hover:text-ink disabled:opacity-40"
                      >
                        {printingOrderId === row.orderId ? (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <Printer className="h-3.5 w-3.5" strokeWidth={2} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
