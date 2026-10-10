import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { OutOfStockError } from "@/lib/inventory/reserve-stock";
import { NoOpenOrderError, joinTableOrder } from "@/lib/orders/join-table-order";
import { UnavailableItemError } from "@/lib/orders/price-snapshot";
import { orderSessionCookieName } from "@/lib/orders/session-cookie";
import { joinTableOrderSchema } from "@/lib/validations/order";

/**
 * Public — a second customer at the same table choosing "add to the open
 * order" at checkout, instead of placing a separate one. Adds their cart
 * straight onto the table's current order (see join-table-order.ts) and
 * binds this browser to it the same way order creation does, so they land
 * on /order/[orderId] and can track the shared order from here on.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ tableId: string }> }
) {
  const { tableId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = joinTableOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  try {
    const order = await joinTableOrder(tableId, parsed.data);
    const orderId = order._id.toString();

    const store = await cookies();
    store.set(orderSessionCookieName(orderId), order.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 6,
    });

    return NextResponse.json({ orderId, orderNumber: order.orderNumber });
  } catch (err) {
    if (err instanceof NoOpenOrderError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    if (err instanceof UnavailableItemError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    if (err instanceof OutOfStockError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
}
