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

interface WaiterCallsResponse {
  orderCalls: { orderId: string; orderNumber: string; tableLabel: string; waiterCallAt: string | null }[];
  tableCalls: { tableId: string; tableLabel: string; waiterCallAt: string | null }[];
}

const POLL_INTERVAL_MS = 4000;

/**
 * Watches GET /api/admin/waiter-calls (polled — see use-realtime-orders.ts
 * for why this isn't SSE anymore) and surfaces active calls as a
 * dismissible toast stack — independent of whichever admin page is open,
 * so a call raised while staff are on Settings or Inventory still gets
 * seen.
 */
export function useWaiterCallToasts() {
  const [toasts, setToasts] = useState<WaiterCallToast[]>([]);
  // Tracks the last-seen waiterCallAt per order/table (key prefixed so the
  // two id spaces can't collide) so a call is only toasted once, and a
  // *new* call on the same order/table (after being acknowledged) still
  // toasts again.
  const seenRef = useRef<Map<string, string | null>>(new Map());

  useEffect(() => {
    let cancelled = false;

    function addToast(toast: WaiterCallToast) {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 10000);
    }

    async function poll() {
      try {
        const res = await fetch("/api/admin/waiter-calls");
        if (!res.ok) return;
        const data: WaiterCallsResponse = await res.json();
        if (cancelled) return;

        for (const call of data.tableCalls) {
          const key = `table:${call.tableId}`;
          const previous = seenRef.current.get(key);
          seenRef.current.set(key, call.waiterCallAt);
          if (call.waiterCallAt && call.waiterCallAt !== previous) {
            addToast({ id: `${key}-${call.waiterCallAt}`, tableId: call.tableId, tableLabel: call.tableLabel });
          }
        }

        for (const call of data.orderCalls) {
          const key = `order:${call.orderId}`;
          const previous = seenRef.current.get(key);
          seenRef.current.set(key, call.waiterCallAt);
          if (call.waiterCallAt && call.waiterCallAt !== previous) {
            addToast({
              id: `${key}-${call.waiterCallAt}`,
              orderId: call.orderId,
              orderNumber: call.orderNumber,
              tableLabel: call.tableLabel,
            });
          }
        }
      } catch {
        // transient network hiccup — next poll tries again
      }
    }

    poll();
    const timer = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return { toasts, dismiss };
}
