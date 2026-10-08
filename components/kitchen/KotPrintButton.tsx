"use client";

import { Button } from "@/components/ui/button";
import type { OrderView } from "@/types/order";

/**
 * Opens a small print window formatted like a thermal KOT (Kitchen Order
 * Ticket) receipt — no prices, just what to make — and triggers the
 * browser's print dialog. Same pattern as TableQrModal's print flow: write
 * a standalone HTML document into a new window and call window.print() on
 * it, rather than trying to style this page itself for print media.
 */
function buildKotHtml(order: OrderView): string {
  const itemRows = order.items
    .map(
      (item) => `
        <div class="item">
          <span class="qty">${item.quantity}x</span>
          <span class="name">${item.name}${item.notes ? ` <em>(${item.notes})</em>` : ""}</span>
        </div>`
    )
    .join("");

  const placedAt = new Date(order.placedAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
    <html>
      <head>
        <title>KOT #${order.orderNumber}</title>
        <style>
          body { font-family: 'Courier New', monospace; width: 280px; margin: 0 auto; padding: 12px; color: #1e1710; }
          .brand { text-align: center; font-family: Georgia, serif; font-weight: bold; font-size: 15px; }
          .kot-label { text-align: center; font-size: 11px; letter-spacing: 0.1em; color: #bc4a28; font-weight: bold; margin: 2px 0 6px; }
          h1 { font-size: 16px; text-align: center; margin: 0 0 4px; }
          .meta { text-align: center; font-size: 12px; margin-bottom: 10px; }
          hr { border: none; border-top: 1px dashed #1e1710; margin: 8px 0; }
          .item { display: flex; gap: 8px; font-size: 14px; padding: 3px 0; }
          .qty { font-weight: bold; min-width: 28px; }
          .notes { font-size: 12px; margin-top: 8px; }
        </style>
      </head>
      <body>
        <div class="brand">Garden Cafe</div>
        <div class="kot-label">KITCHEN ORDER TICKET</div>
        <h1>#${order.orderNumber}</h1>
        <div class="meta">
          ${order.tableLabel ?? "Takeaway"} · ${order.orderType === "dine-in" ? "Dine-in" : "Takeaway"} · ${placedAt}
        </div>
        <hr />
        ${itemRows}
        <hr />
        ${order.notes ? `<p class="notes">Note: ${order.notes}</p>` : ""}
      </body>
    </html>
  `;
}

export function KotPrintButton({ order }: { order: OrderView }) {
  function handlePrint() {
    const printWindow = window.open("", "_blank", "width=320,height=600");
    if (!printWindow) return;
    printWindow.document.write(buildKotHtml(order));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  return (
    <Button variant="secondary" size="sm" onClick={handlePrint}>
      Print KOT
    </Button>
  );
}
