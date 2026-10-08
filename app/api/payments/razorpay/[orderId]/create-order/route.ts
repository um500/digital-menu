import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { initiateOnlinePayment, OrderNotFoundError, PaymentNotApplicableError } from "@/lib/payments/order-payment";
import { orderSessionCookieName } from "@/lib/orders/session-cookie";

/** Customer — cookie-gated the same way as GET /api/orders/[orderId]. */
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
    const { order, razorpayOrderId, amount, currency } = await initiateOnlinePayment(
      orderId,
      sessionToken
    );

    const keyId = process.env.RAZORPAY_KEY_ID;
    if (!keyId) {
      return NextResponse.json({ error: "Online payment is not configured." }, { status: 503 });
    }

    return NextResponse.json({
      razorpayOrderId,
      amount,
      currency,
      keyId,
      orderNumber: order.orderNumber,
    });
  } catch (err) {
    if (err instanceof OrderNotFoundError) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (err instanceof PaymentNotApplicableError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
}
