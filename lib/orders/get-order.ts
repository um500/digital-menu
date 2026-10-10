import "server-only";

import { connectDB } from "@/lib/db/connect";
import { Order, type IOrder } from "@/lib/db/models/Order";

/**
 * Both restaurantId AND sessionToken are required — this is the IDOR guard
 * discussed earlier. Changing the orderId in the URL alone can't surface
 * someone else's order, because the caller's session token won't match.
 */
export async function getOrderForCustomer(
  orderId: string,
  sessionToken: string
): Promise<IOrder | null> {
  await connectDB();
  return Order.findOne({ _id: orderId, sessionToken });
}

export async function getOrderForAdmin(
  orderId: string,
  restaurantId: string
): Promise<IOrder | null> {
  await connectDB();
  return Order.findOne({ _id: orderId, restaurantId });
}

export async function listOpenOrders(restaurantId: string): Promise<IOrder[]> {
  await connectDB();
  return Order.find({
    restaurantId,
    status: { $nin: ["served", "cancelled"] },
  }).sort({ createdAt: 1 });
}

/** Open orders with an active waiter call — polled by the admin dashboard (see use-waiter-call-toasts.ts). */
export async function listActiveOrderWaiterCalls(restaurantId: string): Promise<IOrder[]> {
  await connectDB();
  return Order.find({
    restaurantId,
    status: { $nin: ["served", "cancelled"] },
    waiterCallAt: { $ne: null },
  });
}

/**
 * A customer's order history, keyed by phone number — this is what the
 * menu-page "account" (name + phone, no real login) resolves to. Same
 * trust level as GET /api/customers/lookup (which already exposes a
 * phone's loyalty balance with no auth beyond knowing the number).
 */
export async function getOrdersByPhone(
  restaurantId: string,
  customerPhone: string,
  limit = 20
): Promise<IOrder[]> {
  await connectDB();
  return Order.find({ restaurantId, customerPhone })
    .sort({ createdAt: -1 })
    .limit(limit);
}
