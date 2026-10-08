import "server-only";

import { connectDB } from "@/lib/db/connect";
import { Order, type IOrder } from "@/lib/db/models/Order";
import { publishOrderEvent } from "@/lib/realtime/order-events";
import { createRazorpayOrder, verifyRazorpaySignature } from "./razorpay";

export class OrderNotFoundError extends Error {
  constructor() {
    super("Order not found.");
  }
}

export class PaymentNotApplicableError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class PaymentVerificationError extends Error {
  constructor() {
    super("Payment could not be verified.");
  }
}

/**
 * Customer-side — creates (or reuses) the Razorpay order backing this
 * Garden Cafe order's payment, so the checkout widget has something to pay
 * against. Idempotent: calling this again for an order that already has a
 * razorpayOrderId just returns the same one, rather than opening a second
 * payment for the same bill (e.g. the customer re-opens the page).
 */
export async function initiateOnlinePayment(
  orderId: string,
  sessionToken: string
): Promise<{ order: IOrder; razorpayOrderId: string; amount: number; currency: string }> {
  await connectDB();

  const order = await Order.findOne({ _id: orderId, sessionToken });
  if (!order) throw new OrderNotFoundError();
  if (order.paymentMethod !== "online") {
    throw new PaymentNotApplicableError("This order isn't set up for online payment.");
  }
  if (order.paymentStatus === "approved") {
    throw new PaymentNotApplicableError("This order has already been paid.");
  }

  if (order.razorpayOrderId) {
    return {
      order,
      razorpayOrderId: order.razorpayOrderId,
      amount: Math.round(order.total * 100),
      currency: "INR",
    };
  }

  const { razorpayOrderId, amount, currency } = await createRazorpayOrder(
    order.total,
    order._id.toString()
  );

  order.razorpayOrderId = razorpayOrderId;
  await order.save();

  return { order, razorpayOrderId, amount, currency };
}

/**
 * Customer-side — called from the Razorpay checkout widget's success
 * handler. Verifies the signature server-side before trusting anything the
 * browser reported; the handler callback runs in the customer's browser
 * and a forged "it succeeded" call must not be able to mark an order paid.
 */
export async function confirmOnlinePayment(
  orderId: string,
  sessionToken: string,
  params: { razorpayOrderId: string; razorpayPaymentId: string; signature: string }
): Promise<IOrder> {
  await connectDB();

  const order = await Order.findOne({ _id: orderId, sessionToken });
  if (!order) throw new OrderNotFoundError();
  if (!order.razorpayOrderId || order.razorpayOrderId !== params.razorpayOrderId) {
    throw new PaymentVerificationError();
  }

  const isValid = verifyRazorpaySignature(
    params.razorpayOrderId,
    params.razorpayPaymentId,
    params.signature
  );
  if (!isValid) throw new PaymentVerificationError();

  order.paymentStatus = "approved";
  order.razorpayPaymentId = params.razorpayPaymentId;
  await order.save();

  publishOrderEvent(order.restaurantId, { type: "order.updated", order });
  return order;
}

/**
 * Admin-side — for cash/card orders settled in person at the table or
 * counter, there's no gateway callback to confirm payment, so the admin
 * marks it paid directly once the bill is actually settled.
 */
export async function markOrderPaid(restaurantId: string, orderId: string): Promise<IOrder> {
  await connectDB();

  const order = await Order.findOneAndUpdate(
    { _id: orderId, restaurantId },
    { $set: { paymentStatus: "approved" } },
    { new: true }
  );
  if (!order) throw new OrderNotFoundError();

  publishOrderEvent(restaurantId, { type: "order.updated", order });
  return order;
}
