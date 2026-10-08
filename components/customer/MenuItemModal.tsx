"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils";
import type { MenuItem } from "@/types/menu";

interface MenuItemModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAdd: (item: MenuItem, quantity: number, notes?: string) => void;
}

export function MenuItemModal({ item, onClose, onAdd }: MenuItemModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  if (!item) return null;

  // Captured as a const so the closure below keeps the non-null narrowing
  // (TypeScript doesn't carry a parameter's narrowing into nested functions).
  const activeItem = item;

  function handleAdd() {
    onAdd(activeItem, quantity, notes.trim() || undefined);
    setQuantity(1);
    setNotes("");
    onClose();
  }

  return (
    <Modal open={!!item} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span
            className={`h-3 w-3 flex-shrink-0 rounded-sm border ${
              item.foodType === "veg" ? "border-green-600" : "border-red-600"
            }`}
          >
            <span
              className={`m-auto mt-[2px] block h-1.5 w-1.5 rounded-full ${
                item.foodType === "veg" ? "bg-green-600" : "bg-red-600"
              }`}
            />
          </span>
          <h2 className="font-display text-lg font-semibold text-ink">{item.name}</h2>
        </div>

        <div>
          {item.description && <p className="text-sm text-ink/50">{item.description}</p>}
          <p className="mt-2 text-base font-semibold text-ink">{formatCurrency(item.price)}</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="notes" className="text-sm font-medium text-ink/70">
            Special instructions (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={200}
            rows={2}
            placeholder="e.g. less spicy"
            className="w-full rounded-lg border border-border p-2 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-light"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              −
            </Button>
            <span className="w-6 text-center font-medium text-ink">{quantity}</span>
            <Button variant="secondary" size="sm" onClick={() => setQuantity((q) => q + 1)}>
              +
            </Button>
          </div>

          <Button onClick={handleAdd}>
            Add · {formatCurrency(item.price * quantity)}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
