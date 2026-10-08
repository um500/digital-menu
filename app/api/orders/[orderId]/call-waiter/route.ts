import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { requireAdmin, UnauthorizedError } from "@/lib/auth/guards";
import {
  acknowledgeWaiterCall,
  raiseWaiterCall,
  OrderNotFoundError,
  WaiterAlreadyCalledError,
} from "@/lib/orders/call-waiter";
import { orderSessionCookieName } from "@/lib/orders/session-cookie";

/** Customer — raises a call. Cookie-gated the same way as GET /api/orders/[orderId]. */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const store = await cookies();
  const sessionToken = store.get(orderSessionCookieName(orderId))?.value;

  if (!sessionToken) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  try {
    const order = await raiseWaiterCall(orderId, sessionToken);
    return NextResponse.json({ order });
  } catch (err) {
    if (err instanceof OrderNotFoundError) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (err instanceof WaiterAlreadyCalledError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
}

/** Admin — acknowledges and clears the call. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await requireAdmin();
    const { orderId } = await params;
    const order = await acknowledgeWaiterCall(orderId, session.restaurantId);
    return NextResponse.json({ order });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof OrderNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    throw err;
  }
}
