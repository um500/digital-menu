import { NextResponse } from "next/server";

import { requireAdmin, UnauthorizedError } from "@/lib/auth/guards";
import { getOrderForAdmin } from "@/lib/orders/get-order";

/**
 * Fetches one order regardless of status (served/cancelled included) — used
 * by the GST Sales Register's reprint action, since the Live Orders board
 * only ever shows open orders. Scoped by restaurantId like every other
 * admin order lookup.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await requireAdmin();
    const { orderId } = await params;
    const order = await getOrderForAdmin(orderId, session.restaurantId);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw err;
  }
}
