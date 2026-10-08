"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { CartLine } from "@/store/cart-store";

interface CartItemProps {
  line: CartLine;
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  onRemove: (menuItemId: string) => void;
}

export function CartItem({ line, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-ink">{line.name}</p>
        {line.notes && <p className="text-xs text-ink/50">{line.notes}</p>}
        <p className="text-sm text-ink/60">{formatCurrency(line.price)}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            line.quantity === 1 ? onRemove(line.menuItemId) : onUpdateQuantity(line.menuItemId, line.quantity - 1)
          }
        >
          −
        </Button>
        <span className="w-6 text-center text-sm font-medium text-ink">{line.quantity}</span>
        <Button variant="secondary" size="sm" onClick={() => onUpdateQuantity(line.menuItemId, line.quantity + 1)}>
          +
        </Button>
      </div>
    </div>
  );
}
