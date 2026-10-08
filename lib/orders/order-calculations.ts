import type { IOrderItem } from "@/lib/db/models/Order";

export interface OrderTotals {
  subtotal: number;
  taxTotal: number;
  total: number;
}

/**
 * Always recomputed server-side from the snapshotted items — never trust a
 * total the client sends. Rounds to the nearest rupee at the end, not per
 * line, so totals don't drift from rounding many small items.
 */
export function calculateOrderTotals(items: IOrderItem[], discountTotal = 0): OrderTotals {
  let subtotal = 0;
  let taxTotal = 0;

  for (const item of items) {
    const customizationTotal =
      item.customizations?.reduce((sum, c) => sum + c.priceDelta, 0) ?? 0;
    const lineBase = (item.price + customizationTotal) * item.quantity;
    const lineTax = lineBase * (item.taxPercent / 100);

    subtotal += lineBase;
    taxTotal += lineTax;
  }

  const total = Math.round(subtotal + taxTotal - discountTotal);

  return {
    subtotal: Math.round(subtotal),
    taxTotal: Math.round(taxTotal),
    total: Math.max(total, 0),
  };
}
