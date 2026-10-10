"use client";

import { Bell, Check } from "lucide-react";
import { useState } from "react";

import { DEMO_RESTAURANT_ID } from "@/config/restaurant";

/**
 * Top-of-page button on the menu itself — works before any order is placed
 * (unlike the per-order WaiterCallButton on /order/[orderId], which needs
 * an orderId to exist). Tracked optimistically on this device only; the
 * admin side is told via the table-level realtime event regardless.
 */
export function TableWaiterCallButton({ tableId }: { tableId: string | null }) {
  const [state, setState] = useState<"idle" | "calling" | "called">("idle");

  if (!tableId) return null;

  async function handleCall() {
    setState("calling");
    try {
      const res = await fetch(`/api/tables/${tableId}/call-waiter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId: DEMO_RESTAURANT_ID }),
      });
      if (res.ok || res.status === 409) {
        // 409 just means a call is already active for this table — still "called" from this customer's point of view.
        setState("called");
        setTimeout(() => setState("idle"), 60000);
      } else {
        setState("idle");
      }
    } catch {
      setState("idle");
    }
  }

  if (state === "called") {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5 text-xs font-medium text-accent-dark">
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        Waiter called
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCall}
      disabled={state === "calling"}
      className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-white transition-opacity disabled:opacity-60"
    >
      <Bell className="h-3.5 w-3.5" strokeWidth={2} />
      {state === "calling" ? "Calling..." : "Call waiter"}
    </button>
  );
}
