import "server-only";

import { connectDB } from "@/lib/db/connect";
import { Order, type IOrder, type OrderStatus } from "@/lib/db/models/Order";
import { Table } from "@/lib/db/models/Table";
import { canTransition } from "@/lib/constants/order-status";
import { publishOrderEvent } from "@/lib/realtime/order-events";

export class InvalidTransitionError extends Error {
  constructor(from: OrderStatus, to: OrderStatus) {
    super(`Cannot move an order from "${from}" to "${to}"`);
  }
}

export async function updateOrderStatus(
  orderId: string,
  restaurantId: string,
  nextStatus: OrderStatus,
  staffName?: string
): Promise<IOrder> {
  await connectDB();

  const order = await Order.findOne({ _id: orderId, restaurantId });
  if (!order) throw new Error("Order not found");

  if (!canTransition(order.status, nextStatus)) {
    throw new InvalidTransitionError(order.status, nextStatus);
  }

  order.status = nextStatus;
  if (staffName) order.lastHandledByStaff = staffName;
  await order.save();

  // Free up the table once the order is served or cancelled.
  if ((nextStatus === "served" || nextStatus === "cancelled") && order.tableId) {
    await Table.updateOne(
      { _id: order.tableId, activeOrderId: order._id },
      { status: "empty", activeOrderId: null }
    );
  }

  publishOrderEvent(restaurantId, { type: "order.updated", order });

  return order;
}
