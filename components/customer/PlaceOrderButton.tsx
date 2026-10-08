"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DEMO_RESTAURANT_ID } from "@/config/restaurant";
import { useCart } from "@/hooks/use-cart";
import type { PaymentMethod } from "@/types/order";

interface PlaceOrderButtonProps {
  tableId: string | null;
  customerName?: string;
  customerPhone?: string;
  couponCode?: string;
  redeemPoints?: number;
  paymentMethod?: PaymentMethod;
  onOrderPlaced: (orderId: string) => void;
}

export function PlaceOrderButton({
  tableId,
  customerName,
  customerPhone,
  couponCode,
  redeemPoints,
  paymentMethod,
  onOrderPlaced,
}: PlaceOrderButtonProps) {
  const { lines, clear } = useCart();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);

  async function handlePlaceOrder() {
    setError(null);
    setIsPlacing(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: DEMO_RESTAURANT_ID,
          tableId: tableId ?? undefined,
          items: lines.map((l) => ({
            menuItemId: l.menuItemId,
            quantity: l.quantity,
            notes: l.notes,
          })),
          customerName,
          customerPhone,
          couponCode,
          redeemPoints,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not place order. Try again.");
        return;
      }

      clear();
      onOrderPlaced(data.orderId);
      router.push(`/order/${data.orderId}`);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setIsPlacing(false);
    }
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button
        type="button"
        className="w-full"
        size="lg"
        isLoading={isPlacing}
        disabled={lines.length === 0}
        onClick={handlePlaceOrder}
      >
        Place order
      </Button>
    </div>
  );
}
