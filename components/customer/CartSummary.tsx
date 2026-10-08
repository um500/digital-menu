import { formatCurrency } from "@/lib/utils";

interface CartSummaryProps {
  subtotal: number;
  note?: string;
}

/**
 * Shows an ESTIMATE only. Tax and the exact total are always the server's
 * recomputed figures from checkout — see lib/orders/order-calculations.ts —
 * since menu tax rates can vary per item.
 */
export function CartSummary({ subtotal, note = "Taxes calculated at checkout" }: CartSummaryProps) {
  return (
    <div className="space-y-1 border-t border-border pt-3">
      <div className="flex justify-between text-sm">
        <span className="text-ink/50">Subtotal</span>
        <span className="font-medium text-ink">{formatCurrency(subtotal)}</span>
      </div>
      <p className="text-xs text-ink/40">{note}</p>
    </div>
  );
}
