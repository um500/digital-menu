"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import type { TableView } from "@/types/table";

export interface CounterCartLine {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CounterCartPanelProps {
  lines: CounterCartLine[];
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  emptyTables: TableView[];
  tableId: string | null; // null = takeaway
  onTableChange: (tableId: string | null) => void;
  customerName: string;
  onCustomerNameChange: (name: string) => void;
  customerPhone: string;
  onCustomerPhoneChange: (phone: string) => void;
  onPlaceOrder: () => void;
  isPlacing: boolean;
  error: string | null;
}

export function CounterCartPanel({
  lines,
  onUpdateQuantity,
  emptyTables,
  tableId,
  onTableChange,
  customerName,
  onCustomerNameChange,
  customerPhone,
  onCustomerPhoneChange,
  onPlaceOrder,
  isPlacing,
  error,
}: CounterCartPanelProps) {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  return (
    <div className="space-y-4 rounded-xl border border-border bg-white p-4">
      <h2 className="text-sm font-semibold text-ink">Order</h2>

      {lines.length === 0 ? (
        <p className="text-sm text-ink/50">Add items from the menu on the left.</p>
      ) : (
        <ul className="space-y-2">
          {lines.map((line) => (
            <li key={line.menuItemId} className="flex items-center justify-between text-sm">
              <span className="flex-1 text-ink/70">{line.name}</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onUpdateQuantity(line.menuItemId, line.quantity - 1)}
                >
                  −
                </Button>
                <span className="w-5 text-center">{line.quantity}</span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onUpdateQuantity(line.menuItemId, line.quantity + 1)}
                >
                  +
                </Button>
                <span className="w-16 text-right font-medium text-ink">
                  {formatCurrency(line.price * line.quantity)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {lines.length > 0 && (
        <div className="flex justify-between border-t border-border pt-2 text-sm font-semibold text-ink">
          <span>Subtotal (est.)</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="counter-table" className="text-sm font-medium text-ink/70">
          Dine-in table or takeaway
        </label>
        <select
          id="counter-table"
          value={tableId ?? "takeaway"}
          onChange={(e) => onTableChange(e.target.value === "takeaway" ? null : e.target.value)}
          className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-light"
        >
          <option value="takeaway">Takeaway / parcel</option>
          {emptyTables.map((t) => (
            <option key={t._id} value={t._id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input
          placeholder="Customer name (optional)"
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
        />
        <Input
          placeholder="Phone (optional)"
          inputMode="numeric"
          value={customerPhone}
          onChange={(e) => onCustomerPhoneChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        className="w-full"
        size="lg"
        disabled={lines.length === 0}
        isLoading={isPlacing}
        onClick={onPlaceOrder}
      >
        Place order
      </Button>
    </div>
  );
}
