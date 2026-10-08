"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { KitchenBoard } from "@/components/kitchen/KitchenBoard";
import { KitchenHeader } from "@/components/kitchen/KitchenHeader";
import { Loading } from "@/components/shared/Loading";
import { useRealtimeOrders } from "@/hooks/use-realtime-orders";

/**
 * Meant to run on an always-on kitchen tablet. It authenticates the same way
 * the admin dashboard does (see api/kitchen/stream/route.ts) — sign in once
 * via /admin/login on this device, then leave this page open for the shift.
 */
export default function KitchenPage() {
  const router = useRouter();
  const { orders, isLoading, isConnected } = useRealtimeOrders("/api/kitchen/stream");

  useEffect(() => {
    fetch("/api/orders").then((res) => {
      if (res.status === 401) router.replace("/admin/login");
    });
  }, [router]);

  // Orders only reach the kitchen once payment is settled (online: verified
  // via Razorpay; cash/card: approved by an admin on Live Orders) — see
  // lib/orders/create-order.ts for the payment-at-checkout fraud gate this
  // enforces. Counter orders are auto-approved there, so they show up here
  // immediately like before.
  const activeOrders = orders.filter(
    (o) => !["served", "cancelled"].includes(o.status) && o.paymentStatus === "approved"
  );

  return (
    <div className="min-h-screen bg-ink">
      <KitchenHeader isConnected={isConnected} openTicketCount={activeOrders.length} />
      {isLoading ? (
        <Loading label="Loading kitchen orders..." className="text-cream/40" />
      ) : activeOrders.length === 0 ? (
        <p className="py-20 text-center text-sm text-cream/40">No active orders right now.</p>
      ) : (
        <KitchenBoard orders={activeOrders} />
      )}
    </div>
  );
}
