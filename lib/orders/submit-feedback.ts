import "server-only";

import { connectDB } from "@/lib/db/connect";
import { Order, type IOrder } from "@/lib/db/models/Order";

export class OrderNotFoundError extends Error {
  constructor() {
    super("Order not found.");
  }
}

export class FeedbackNotAllowedError extends Error {
  constructor() {
    super("Feedback can only be left once an order has been served.");
  }
}

export class FeedbackAlreadySubmittedError extends Error {
  constructor() {
    super("Feedback for this order has already been submitted.");
  }
}

/** Customer-side — IDOR-safe via sessionToken. Only allowed once, only after "served". */
export async function submitOrderFeedback(
  orderId: string,
  sessionToken: string,
  rating: number,
  comment?: string
): Promise<IOrder> {
  await connectDB();

  const order = await Order.findOne({ _id: orderId, sessionToken });
  if (!order) throw new OrderNotFoundError();
  if (order.status !== "served") throw new FeedbackNotAllowedError();
  if (order.feedback) throw new FeedbackAlreadySubmittedError();

  order.feedback = { rating, comment, submittedAt: new Date() };
  await order.save();

  return order;
}
