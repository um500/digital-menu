"use client";

import { useState } from "react";

import type { OrderStatus, OrderView } from "@/types/order";
import { LiveOrderCard } from "./LiveOrderCard";
import { OrderDetailModal } from "./OrderDetailModal";

const COLUMNS: { statuses: OrderStatus[]; label: string }[] = [
  { statuses: ["placed", "accepted"], label: "Placed" },
  { statuses: ["preparing"], label: "Preparing" },
  { statuses: ["ready"], label: "Ready" },
  { statuses: ["served"], label: "Served" },
];

/**
 * Four-column kanban board. `orders` only ever contains open orders plus
 * whichever ones have transitioned to served/cancelled during this live
 * session (see use-realtime-orders.ts — the initial fetch is open-only, but
 * SSE updates are kept rather than dropped) — exactly the "recently served"
 * view this board wants, with no extra backend call.
 */
export function LiveOrderBoard({ orders }: { orders: OrderView[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedOrder = orders.find((o) => o._id === selectedId) ?? null;

  if (orders.length === 0) {
    return <p className="p-6 text-center text-sm text-ink/40">No open orders right now.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((col) => {
          const columnOrders = orders.filter((o) => col.statuses.includes(o.status));
          return (
            <div key={col.label} className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold text-ink/70">{col.label}</h3>
                <span className="rounded-full bg-cream-soft px-2 py-0.5 text-xs font-medium text-ink/50">
                  {columnOrders.length}
                </span>
              </div>
              <div className="flex flex-col gap-2.5">
                {columnOrders.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-ink/30">
                    No orders
                  </p>
                ) : (
                  columnOrders.map((order) => (
                    <LiveOrderCard
                      key={order._id}
                      order={order}
                      onOpen={() => setSelectedId(order._id)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedId(null)} />
    </>
  );
}
