import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { requireAdmin, UnauthorizedError } from "@/lib/auth/guards";
import { InvalidCouponError } from "@/lib/coupons/validate-coupon";
import { OutOfStockError } from "@/lib/inventory/reserve-stock";
import { InsufficientPointsError } from "@/lib/loyalty/customer-loyalty";
import { createOrder } from "@/lib/orders/create-order";
import { listOpenOrders } from "@/lib/orders/get-order";
import { UnavailableItemError } from "@/lib/orders/price-snapshot";
import { orderSessionCookieName } from "@/lib/orders/session-cookie";
import { createOrderSchema } from "@/lib/validations/order";

/** Public — a customer scanning a table QR has no admin session. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid order" },
      { status: 400 }
    );
  }

  try {
    const order = await createOrder(parsed.data);

    // Bind this browser to the order it just placed. order/[orderId]/page.tsx
    // checks this cookie before showing status — see lib/orders/get-order.ts.
    const orderId = order._id.toString();

    const store = await cookies();
    store.set(orderSessionCookieName(orderId), order.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 6, // 6 hours — long enough to cover a sit-down meal
    });

    return NextResponse.json({ orderId, orderNumber: order.orderNumber }, { status: 201 });
  } catch (err) {
    if (err instanceof UnavailableItemError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    if (err instanceof InvalidCouponError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    if (err instanceof InsufficientPointsError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    if (err instanceof OutOfStockError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
}

/** Admin-only — Live Orders board. */
export async function GET() {
  try {
    const session = await requireAdmin();
    const orders = await listOpenOrders(session.restaurantId);
    return NextResponse.json({ orders });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw err;
  }
}
