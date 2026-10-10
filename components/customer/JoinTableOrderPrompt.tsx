"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DEMO_RESTAURANT_ID } from "@/config/restaurant";
import type { CartLine } from "@/store/cart-store";
import { useTableOpenOrder } from "@/hooks/use-table-open-order";

interface JoinTableOrderPromptProps {
  tableId: string | null;
  lines: CartLine[];
  onJoined: (orderId: string) => void;
}

/**
 * Shown at checkout when someone else at the same table already has an
 * order running — lets this customer add their cart straight onto it (one
 * kitchen ticket, one bill) instead of the two of them accidentally ending
 * up with separate tickets. Dismissing it just hides the banner; the
 * ordinary checkout form below still places a separate order as before.
 */
export function JoinTableOrderPrompt({ tableId, lines, onJoined }: JoinTableOrderPromptProps) {
  const { openOrder } = useTableOpenOrder(tableId);
  const [dismissed, setDismissed] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!openOrder || dismissed) return null;

  async function handleJoin() {
    setError(null);
    setIsJoining(true);
    try {
      const res = await fetch(`/api/tables/${tableId}/join-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: DEMO_RESTAURANT_ID,
          items: lines.map((l) => ({
            menuItemId: l.menuItemId,
            quantity: l.quantity,
            notes: l.notes,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not add to that order. Try again.");
        return;
      }
      onJoined(data.orderId);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setIsJoining(false);
    }
  }

  return (
    <div className="mb-4 rounded-xl border border-primary/20 bg-primary-light p-4">
      <p className="text-sm font-medium text-ink">
        This table already has an order running — #{openOrder.orderNumber} ({openOrder.itemCount}{" "}
        item{openOrder.itemCount === 1 ? "" : "s"}).
      </p>
      <p className="mt-1 text-xs text-ink/50">
        Add your items to it so the kitchen gets one ticket and the table gets one bill, or keep
        yours separate.
      </p>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <div className="mt-3 flex gap-2">
        <Button size="sm" isLoading={isJoining} onClick={handleJoin} className="flex-1">
          Add to that order
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setDismissed(true)} className="flex-1">
          Keep separate
        </Button>
      </div>
    </div>
  );
}
