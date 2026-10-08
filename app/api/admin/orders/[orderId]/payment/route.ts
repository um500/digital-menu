import { NextResponse } from "next/server";

import { requireAdmin, UnauthorizedError } from "@/lib/auth/guards";
import { markOrderPaid, OrderNotFoundError } from "@/lib/payments/order-payment";

/** Admin — marks a cash/card order as paid once settled in person. */
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  try {
    const session = await requireAdmin();
    const order = await markOrderPaid(session.restaurantId, orderId);
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
