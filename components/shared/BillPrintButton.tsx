"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { OrderView } from "@/types/order";

interface BillPrintButtonProps {
  order: OrderView;
  restaurantName: string;
  gstNumber?: string;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  online: "Online (UPI/Card)",
  cash: "Cash",
  card: "Card",
  manual: "Manual",
};

/**
 * Prints a GST-style itemized bill — same window.print() pattern as the
 * table QR and KOT print flows. Splits each line's tax evenly into
 * CGST + SGST (the standard presentation for an intra-state restaurant
 * bill); this product doesn't currently support inter-state billing
 * (IGST), which would need a different split.
 */
function buildBillHtml(order: OrderView, restaurantName: string, gstNumber?: string): string {
  const itemRows = order.items
    .map((item) => {
      const lineAmount = item.price * item.quantity;
      return `
        <tr>
          <td>${item.name}</td>
          <td class="num">${item.quantity}</td>
          <td class="num">${formatCurrency(item.price)}</td>
          <td class="num">${formatCurrency(lineAmount)}</td>
        </tr>`;
    })
    .join("");

  const placedAt = new Date(order.placedAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const halfTax = order.taxTotal / 2;
  const isPaid = order.paymentStatus === "approved";
  const paymentLabel = PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod;

  return `
    <html>
      <head>
        <title>Bill #${order.orderNumber}</title>
        <style>
          body { font-family: 'Courier New', monospace; width: 320px; margin: 0 auto; padding: 14px; font-size: 13px; color: #1e1710; }
          .brand { text-align: center; font-family: Georgia, serif; font-weight: bold; font-size: 18px; }
          .invoice-label { text-align: center; font-size: 11px; letter-spacing: 0.1em; color: #bc4a28; font-weight: bold; margin-top: 2px; }
          .meta { text-align: center; font-size: 11px; color: #444; margin: 6px 0 10px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { text-align: left; padding: 3px 0; }
          .num { text-align: right; }
          hr { border: none; border-top: 1px dashed #1e1710; margin: 8px 0; }
          .totals td { padding: 2px 0; }
          .grand { font-weight: bold; font-size: 15px; }
          .status-row { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
          .badge { display: inline-block; padding: 2px 10px; border-radius: 10px; font-size: 11px; font-weight: bold; }
          .badge-paid { background: #e3f2ec; color: #175646; }
          .badge-pending { background: #fde68a; color: #92400e; }
        </style>
      </head>
      <body>
        <div class="brand">${restaurantName}</div>
        <div class="invoice-label">TAX INVOICE</div>
        <div class="meta">
          ${gstNumber ? `GSTIN: ${gstNumber}<br/>` : ""}
          Invoice #${order.orderNumber} · ${order.tableLabel ?? "Takeaway"} · ${placedAt}
        </div>
        <hr />
        <table>
          <thead>
            <tr><th>Item</th><th class="num">Qty</th><th class="num">Rate</th><th class="num">Amount</th></tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
        <hr />
        <table class="totals">
          <tr><td>Subtotal</td><td class="num">${formatCurrency(order.subtotal)}</td></tr>
          <tr><td>CGST</td><td class="num">${formatCurrency(halfTax)}</td></tr>
          <tr><td>SGST</td><td class="num">${formatCurrency(halfTax)}</td></tr>
          ${
            order.discountTotal > 0
              ? `<tr><td>Discount${order.couponCode ? ` (${order.couponCode})` : ""}</td><td class="num">-${formatCurrency(order.discountTotal)}</td></tr>`
              : ""
          }
          <tr class="grand"><td>Total</td><td class="num">${formatCurrency(order.total)}</td></tr>
        </table>
        <div class="status-row">
          <span>${paymentLabel}${order.razorpayPaymentId ? ` · Ref ${order.razorpayPaymentId}` : ""}</span>
          <span class="badge ${isPaid ? "badge-paid" : "badge-pending"}">${isPaid ? "PAID" : "PENDING"}</span>
        </div>
        <hr />
        <p style="text-align:center;font-size:11px;color:#666;">Thank you for visiting!</p>
      </body>
    </html>
  `;
}

export function BillPrintButton({ order, restaurantName, gstNumber }: BillPrintButtonProps) {
  function handlePrint() {
    const printWindow = window.open("", "_blank", "width=360,height=640");
    if (!printWindow) return;
    printWindow.document.write(buildBillHtml(order, restaurantName, gstNumber));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  return (
    <Button variant="secondary" size="sm" onClick={handlePrint}>
      Print bill
    </Button>
  );
}
