"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useActiveStaff } from "@/hooks/use-active-staff";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  placed: "accepted",
  accepted: "preparing",
  preparing: "ready",
  ready: "served",
};

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  placed: "Accept",
  accepted: "Start preparing",
  preparing: "Mark ready",
  ready: "Mark served",
};

export function KitchenStatusButton({
  orderId,
  status,
  className,
}: {
  orderId: string;
  status: OrderStatus;
  className?: string;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { staff } = useActiveStaff();
  const nextStatus = NEXT_STATUS[status];

  if (!nextStatus) return null;

  async function handleClick() {
    setIsUpdating(true);
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, staffName: staff?.name }),
      });
      // No local state update needed — the SSE event this triggers updates the board for everyone, including this tablet.
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <Button size="sm" className={cn("w-full", className)} isLoading={isUpdating} onClick={handleClick}>
      {NEXT_LABEL[status]}
    </Button>
  );
}
