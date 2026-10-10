"use client";

import { useEffect, useState } from "react";

import type { OrderView } from "@/types/order";

const POLL_INTERVAL_MS = 4000;

/**
 * Keeps the Live Orders board / Kitchen board in sync by polling
 * GET /api/orders every few seconds.
 *
 * This used to push updates over Server-Sent Events instead (see
 * lib/realtime/order-events.ts), which felt instant in local dev — but that
 * relies on an in-memory EventEmitter, and Vercel's serverless functions
 * don't share memory across invocations. A customer's "call waiter" POST
 * and the admin dashboard's long-lived SSE GET run as separate, isolated
 * function instances in production, so an event published by one never
 * reached a subscriber in the other — the admin side just never heard
 * about it. Polling is a few seconds slower, but it's a plain HTTP request
 * each time, so it actually works regardless of which instance handles it.
 *
 * `streamUrl` is accepted (and ignored) only so existing call sites —
 * which used to pass /api/orders/stream or /api/kitchen/stream — don't
 * need to change.
 */
export function useRealtimeOrders(streamUrl?: string): {
  orders: OrderView[];
  isLoading: boolean;
  isConnected: boolean;
} {
  void streamUrl;
  const [orders, setOrders] = useState<OrderView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error("Failed to load orders");
        const data = await res.json();
        if (cancelled) return;
        setOrders(data.orders ?? []);
        setIsConnected(true);
      } catch {
        if (!cancelled) setIsConnected(false);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    poll();
    const timer = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return { orders, isLoading, isConnected };
}
