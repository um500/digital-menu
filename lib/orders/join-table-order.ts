import "server-only";

import mongoose from "mongoose";

import { connectDB } from "@/lib/db/connect";
import { Order, type IOrder } from "@/lib/db/models/Order";
import { Table } from "@/lib/db/models/Table";
import { reserveStockForOrder } from "@/lib/inventory/reserve-stock";
import { publishOrderEvent } from "@/lib/realtime/order-events";
import type { JoinTableOrderInput } from "@/lib/validations/order";
import { calculateOrderTotals } from "./order-calculations";
import { buildOrderItemSnapshot } from "./price-snapshot";

export class NoOpenOrderError extends Error {
  constructor() {
    super("This table doesn't have an open order to add to.");
  }
}

export interface OpenTableOrderSummary {
  orderId: string;
  orderNumber: string;
  status: IOrder["status"];
  itemCount: number;
}

const OPEN_STATUSES: IOrder["status"][] = ["placed", "accepted", "preparing", "ready"];

/**
 * What a second customer at the same table sees before checking out: is
 * there already an order running for this table they could add to, instead
 * of the kitchen getting two separate tickets for one table?
 */
export async function getOpenOrderForTable(
  tableId: string,
  restaurantId: string
): Promise<OpenTableOrderSummary | null> {
  await connectDB();

  const table = await Table.findOne({ _id: tableId, restaurantId });
  if (!table?.activeOrderId) return null;

  const order = await Order.findOne({ _id: table.activeOrderId, restaurantId });
  if (!order || !OPEN_STATUSES.includes(order.status)) return null;

  return {
    orderId: order._id.toString(),
    orderNumber: order.orderNumber,
    status: order.status,
    itemCount: order.items.reduce((sum, i) => sum + i.quantity, 0),
  };
}

/**
 * Folds a second cart straight into the table's already-open order instead
 * of creating a new one — same item-merge approach as mergeOrders (an
 * admin's manual fix for when this *wasn't* chosen up front), minus the
 * admin auth and the two-order bookkeeping. Existing coupon/loyalty
 * discount on the order is left exactly as it was — only the new items'
 * subtotal/tax are added on top, same simplification mergeOrders makes.
 */
export async function joinTableOrder(
  tableId: string,
  input: JoinTableOrderInput
): Promise<IOrder> {
  await connectDB();

  const table = await Table.findOne({ _id: tableId, restaurantId: input.restaurantId });
  if (!table?.activeOrderId) throw new NoOpenOrderError();

  const newItems = await buildOrderItemSnapshot(input.restaurantId, input.items);

  const session = await mongoose.startSession();
  let order: IOrder;

  try {
    session.startTransaction();

    const found = await Order.findOne({
      _id: table.activeOrderId,
      restaurantId: input.restaurantId,
    }).session(session);

    if (!found || !OPEN_STATUSES.includes(found.status)) {
      throw new NoOpenOrderError();
    }
    order = found;

    await reserveStockForOrder(session, input.restaurantId, newItems);

    order.items.push(...newItems);
    const totals = calculateOrderTotals(order.items, order.discountTotal);
    order.subtotal = totals.subtotal;
    order.taxTotal = totals.taxTotal;
    order.total = totals.total;
    await order.save({ session });

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }

  publishOrderEvent(input.restaurantId, { type: "order.updated", order });
  return order;
}
