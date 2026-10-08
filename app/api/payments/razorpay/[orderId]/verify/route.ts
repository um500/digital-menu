import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { confirmOnlinePayment, OrderNotFoundError, PaymentVerificationError } from "@/lib/payments/order-payment";
import { orderSessionCookieName } from "@/lib/orders/session-cookie";
import { verifyPaymentSchema } from "@/lib/validations/payment";

/** Customer — cookie-gated the same way as GET /api/orders/[orderId]. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const store = await cookies();
  const sessionToken = store.get(orderSessionCookieName(orderId))?.value;

  if (!sessionToken) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = verifyPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment confirmation" }, { status: 400 });
  }

  try {
    const order = await confirmOnlinePayment(orderId, sessionToken, {
      razorpayOrderId: parsed.data.razorpay_order_id,
      razorpayPaymentId: parsed.data.razorpay_payment_id,
      signature: parsed.data.razorpay_signature,
    });
    return NextResponse.json({ order });
  } catch (err) {
    if (err instanceof OrderNotFoundError) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (err instanceof PaymentVerificationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
