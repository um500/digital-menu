import "server-only";

import { connectDB } from "@/lib/db/connect";
import { Order, type IOrder } from "@/lib/db/models/Order";
import { publishOrderEvent } from "@/lib/realtime/order-events";

export class WaiterAlreadyCalledError extends Error {
  constructor() {
    super("A waiter has already been notified for this order.");
  }
}

export class OrderNotFoundError extends Error {
  constructor() {
    super("Order not found.");
  }
}

/** Customer-side — IDOR-safe via sessionToken, same pattern as getOrderForCustomer. */
export async function raiseWaiterCall(orderId: string, sessionToken: string): Promise<IOrder> {
  await connectDB();

  // Atomic: only sets waiterCallAt if it's currently null, so two rapid taps
  // (or two tabs) can't both "succeed" and spam the admin dashboard.
  const order = await Order.findOneAndUpdate(
    { _id: orderId, sessionToken, waiterCallAt: null },
    { $set: { waiterCallAt: new Date() } },
    { new: true }
  );

  if (!order) {
    const exists = await Order.exists({ _id: orderId, sessionToken });
    throw exists ? new WaiterAlreadyCalledError() : new OrderNotFoundError();
  }

  publishOrderEvent(order.restaurantId, { type: "order.updated", order });
  return order;
}

/** Admin-side — acknowledges and clears the call so the customer can raise another one later. */
export async function acknowledgeWaiterCall(orderId: string, restaurantId: string): Promise<IOrder> {
  await connectDB();

  const order = await Order.findOneAndUpdate(
    { _id: orderId, restaurantId },
    { $set: { waiterCallAt: null } },
    { new: true }
  );
  if (!order) throw new OrderNotFoundError();

  publishOrderEvent(restaurantId, { type: "order.updated", order });
  return order;
}
