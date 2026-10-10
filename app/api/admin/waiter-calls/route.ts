import { NextResponse } from "next/server";

import { requireAdmin, UnauthorizedError } from "@/lib/auth/guards";
import { listActiveOrderWaiterCalls } from "@/lib/orders/get-order";
import { listActiveTableWaiterCalls } from "@/lib/tables/get-tables";

/**
 * Polled by the admin dashboard every few seconds (see
 * hooks/use-waiter-call-toasts.ts) — every active "call waiter", whether
 * raised from an order's status page or straight from the menu page before
 * any order exists. Polling, not SSE — see hooks/use-realtime-orders.ts for
 * why push notifications don't reach across Vercel's serverless instances.
 */
export async function GET() {
  try {
    const session = await requireAdmin();
    const [orders, tables] = await Promise.all([
      listActiveOrderWaiterCalls(session.restaurantId),
      listActiveTableWaiterCalls(session.restaurantId),
    ]);

    return NextResponse.json({
      orderCalls: orders.map((o) => ({
        orderId: o._id.toString(),
        orderNumber: o.orderNumber,
        tableLabel: o.tableLabel ?? "Takeaway",
        waiterCallAt: o.waiterCallAt,
      })),
      tableCalls: tables.map((t) => ({
        tableId: t._id.toString(),
        tableLabel: t.label,
        waiterCallAt: t.waiterCallAt,
      })),
    });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw err;
  }
}
