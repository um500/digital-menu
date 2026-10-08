import { NextResponse } from "next/server";

import { requireAdmin, UnauthorizedError } from "@/lib/auth/guards";
import { CannotMergeError, mergeOrders, OrderNotFoundError } from "@/lib/orders/merge-orders";
import { mergeOrdersSchema } from "@/lib/validations/order";

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json().catch(() => null);
    const parsed = mergeOrdersSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Both a source and target order are required" }, { status: 400 });
    }

    const { target, source } = await mergeOrders(
      session.restaurantId,
      parsed.data.sourceOrderId,
      parsed.data.targetOrderId
    );
    return NextResponse.json({ target, source });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof OrderNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err instanceof CannotMergeError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
}
