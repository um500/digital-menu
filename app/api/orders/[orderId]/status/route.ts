import { NextResponse } from "next/server";

import { requireAdmin, UnauthorizedError } from "@/lib/auth/guards";
import { InvalidTransitionError, updateOrderStatus } from "@/lib/orders/update-order-status";
import { updateOrderStatusSchema } from "@/lib/validations/order";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await requireAdmin();
    const { orderId } = await params;

    const body = await req.json().catch(() => null);
    const parsed = updateOrderStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const order = await updateOrderStatus(
      orderId,
      session.restaurantId,
      parsed.data.status,
      parsed.data.staffName
    );
    return NextResponse.json({ order });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof InvalidTransitionError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
}
