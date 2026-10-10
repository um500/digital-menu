"use client";

import { useEffect, useRef, useState } from "react";

export interface WaiterCallToast {
  id: string;
  // Exactly one of these is set — which one decides how the toast
  // acknowledges itself (order route vs table route). See
  // WaiterCallToasts.tsx.
  orderId?: string;
  tableId?: string;
  orderNumber?: string;
  tableLabel: string;
}

interface OrderEventPayload {
  type: "order.created" | "order.updated" | "table.waiterCall";
  order?: {
    _id: string;
    orderNumber: string;
    tableLabel?: string | null;
    waiterCallAt?: string | null;
  };
  table?: {
    _id: string;
    label: string;
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
  // Tracks the last-seen waiterCallAt per order/table (key prefixed so the
  // two id spaces can't collide) so a call is only toasted once, and a
  // *new* call on the same order/table (after being acknowledged) still
  // toasts again.
  const seenRef = useRef<Map<string, string | null>>(new Map());

  useEffect(() => {
    const source = new EventSource("/api/orders/stream");

    function addToast(toast: WaiterCallToast) {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 10000);
    }

    source.onmessage = (event) => {
      try {
        const payload: OrderEventPayload = JSON.parse(event.data);

        if (payload.type === "table.waiterCall" && payload.table) {
          const { table } = payload;
          const key = `table:${table._id}`;
          const previous = seenRef.current.get(key);
          seenRef.current.set(key, table.waiterCallAt ?? null);

          if (table.waiterCallAt && table.waiterCallAt !== previous) {
            addToast({
              id: `${key}-${table.waiterCallAt}`,
              tableId: table._id,
              tableLabel: table.label,
            });
          }
          return;
        }

        if (!payload.order) return;
        const { order } = payload;
        const key = `order:${order._id}`;
        const previous = seenRef.current.get(key);
        seenRef.current.set(key, order.waiterCallAt ?? null);

        if (order.waiterCallAt && order.waiterCallAt !== previous) {
          addToast({
            id: `${key}-${order.waiterCallAt}`,
            orderId: order._id,
            orderNumber: order.orderNumber,
            tableLabel: order.tableLabel ?? "Takeaway",
          });
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
