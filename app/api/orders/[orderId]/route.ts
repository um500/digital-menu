import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getOrderForCustomer } from "@/lib/orders/get-order";
import { orderSessionCookieName } from "@/lib/orders/session-cookie";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  const store = await cookies();
  const sessionToken = store.get(orderSessionCookieName(orderId))?.value;

  // No cookie at all => this browser never placed this order. Generic 404,
  // not 403 — don't confirm to a prober that the orderId itself is real.
  if (!sessionToken) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const order = await getOrderForCustomer(orderId, sessionToken);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}
