"use client";

import { useCallback, useEffect, useState } from "react";

import type { OrderView } from "@/types/order";

interface OrderEventPayload {
  type: "order.created" | "order.updated";
  order: OrderView;
}

/**
 * Loads the current open orders once, then keeps them in sync via SSE.
 * `streamUrl` is /api/orders/stream for the admin board and
 * /api/kitchen/stream for the kitchen display — same payload shape, just a
 * different auth/connection endpoint.
 */
export function useRealtimeOrders(streamUrl: string) {
  const [orders, setOrders] = useState<OrderView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const upsertOrder = useCallback((incoming: OrderView) => {
    setOrders((prev) => {
      const idx = prev.findIndex((o) => o._id === incoming._id);
      if (idx === -1) return [...prev, incoming];
      const next = [...prev];
      next[idx] = incoming;
      return next;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setOrders(data.orders ?? []);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    const source = new EventSource(streamUrl);

    source.onopen = () => setIsConnected(true);
    source.onerror = () => setIsConnected(false);
    source.onmessage = (event) => {
      try {
        const payload: OrderEventPayload = JSON.parse(event.data);
        upsertOrder(payload.order);
      } catch {
        // heartbeat/comment lines have no `data:` field and never reach here
      }
    };

    return () => {
      cancelled = true;
      source.close();
    };
  }, [streamUrl, upsertOrder]);

  return { orders, isLoading, isConnected };
}
