import { NextResponse } from "next/server";

import { requireAdmin, UnauthorizedError } from "@/lib/auth/guards";
import {
  NotDineInOrderError,
  OrderNotFoundError,
  TableInUseError,
  TableNotFoundError,
  transferOrder,
} from "@/lib/orders/transfer-order";
import { transferOrderSchema } from "@/lib/validations/order";

export async function POST(req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  try {
    const session = await requireAdmin();
    const body = await req.json().catch(() => null);
    const parsed = transferOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "A destination table is required" }, { status: 400 });
    }

    const order = await transferOrder(session.restaurantId, orderId, parsed.data.toTableId);
    return NextResponse.json({ order });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof OrderNotFoundError || err instanceof TableNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err instanceof TableInUseError || err instanceof NotDineInOrderError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
}
