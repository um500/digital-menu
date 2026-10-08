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
