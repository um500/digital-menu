import "server-only";

import mongoose from "mongoose";

import { connectDB } from "@/lib/db/connect";
import { Order, type IOrder } from "@/lib/db/models/Order";
import { Table } from "@/lib/db/models/Table";
import { publishOrderEvent } from "@/lib/realtime/order-events";

export class OrderNotFoundError extends Error {
  constructor() {
    super("Order not found.");
  }
}

export class TableNotFoundError extends Error {
  constructor() {
    super("Table not found.");
  }
}

export class TableInUseError extends Error {
  constructor() {
    super("That table already has an active order.");
  }
}

export class NotDineInOrderError extends Error {
  constructor() {
    super("Only dine-in orders can be moved between tables.");
  }
}

/**
 * Moves an active dine-in order from its current table to an empty one —
 * e.g. the party moved seats, or the table they were assigned turned out
 * to be double-booked. Frees the old table and occupies the new one
 * atomically with the order's own tableId/tableLabel update, so there's
 * never a moment where two tables both point at this order (or neither
 * does).
 */
export async function transferOrder(
  restaurantId: string,
  orderId: string,
  toTableId: string
): Promise<IOrder> {
  await connectDB();

  const order = await Order.findOne({ _id: orderId, restaurantId });
  if (!order) throw new OrderNotFoundError();
  if (order.orderType !== "dine-in" || !order.tableId) throw new NotDineInOrderError();
  if (["served", "cancelled"].includes(order.status)) throw new NotDineInOrderError();

  const toTable = await Table.findOne({ _id: toTableId, restaurantId });
  if (!toTable) throw new TableNotFoundError();
  if (toTable.status !== "empty") throw new TableInUseError();

  const fromTableId = order.tableId;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    order.tableId = toTable._id;
    order.tableLabel = toTable.label;
    await order.save({ session });

    await Table.updateOne(
      { _id: fromTableId },
      { status: "empty", activeOrderId: null },
      { session }
    );
    await Table.updateOne(
      { _id: toTable._id },
      { status: "occupied", activeOrderId: order._id },
      { session }
    );

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }

  publishOrderEvent(restaurantId, { type: "order.updated", order });
  return order;
}
