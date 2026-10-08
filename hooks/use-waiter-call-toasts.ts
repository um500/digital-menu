"use client";

import { useEffect, useRef, useState } from "react";

export interface WaiterCallToast {
  id: string;
  orderId: string;
  orderNumber: string;
  tableLabel: string;
}

interface OrderEventPayload {
  type: "order.created" | "order.updated";
  order: {
    _id: string;
    orderNumber: string;
    tableLabel?: string | null;
    waiterCallAt?: string | null;
  };
}

/**
 * Watches the admin order stream for waiter calls and surfaces them as a
 * dismissible toast stack — independent of whichever admin page is open, so
 * a call raised while staff are on Settings or Inventory still gets seen.
 * Separate SSE connection from any page-level order list (e.g. Live
 * Orders' kanban board); the duplicate connection is a small cost for
 * toasts that work everywhere in the admin shell.
 */
export function useWaiterCallToasts() {
  const [toasts, setToasts] = useState<WaiterCallToast[]>([]);
  // Tracks the last-seen waiterCallAt per order so a call is only toasted
  // once, and a *new* call on the same order (after being acknowledged)
  // still toasts again.
  const seenRef = useRef<Map<string, string | null>>(new Map());

  useEffect(() => {
    const source = new EventSource("/api/orders/stream");

    source.onmessage = (event) => {
      try {
        const payload: OrderEventPayload = JSON.parse(event.data);
        const { order } = payload;
        const previous = seenRef.current.get(order._id);
        seenRef.current.set(order._id, order.waiterCallAt ?? null);

        if (order.waiterCallAt && order.waiterCallAt !== previous) {
          const toast: WaiterCallToast = {
            id: `${order._id}-${order.waiterCallAt}`,
            orderId: order._id,
            orderNumber: order.orderNumber,
            tableLabel: order.tableLabel ?? "Takeaway",
          };
          setToasts((prev) => [...prev, toast]);
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== toast.id));
          }, 10000);
        }
      } catch {
        // heartbeat/comment lines have no `data:` field and never reach here
      }
    };

    return () => source.close();
  }, []);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return { toasts, dismiss };
}
