import "server-only";

import mongoose from "mongoose";

import { connectDB } from "@/lib/db/connect";
import { Order, type IOrder } from "@/lib/db/models/Order";
import { Table } from "@/lib/db/models/Table";
import { publishOrderEvent } from "@/lib/realtime/order-events";
import { calculateOrderTotals } from "./order-calculations";

export class OrderNotFoundError extends Error {
  constructor(which: "source" | "target") {
    super(`${which === "source" ? "Source" : "Target"} order not found.`);
  }
}

export class CannotMergeError extends Error {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Folds a source order's items into a target order — e.g. a table ordered
 * a second round under a fresh order instead of adding to the first, or two
 * tables are being combined onto one bill. The source order's items move
 * over, the target's totals are recomputed from its (now larger) item list,
 * and the source is marked cancelled + `mergedIntoOrderId` rather than
 * deleted, so reports still account for it.
 *
 * Any coupon/loyalty discount already applied to the SOURCE order is not
 * carried over — only its items move. The target keeps its own discount.
 * This is a deliberate simplification: re-resolving a second coupon against
 * a combined bill opens re-validation questions (usage limits, min-order
 * amounts) that aren't worth solving for what is an occasional front-of-house
 * correction, not a checkout flow.
 */
export async function mergeOrders(
  restaurantId: string,
  sourceOrderId: string,
  targetOrderId: string
): Promise<{ target: IOrder; source: IOrder }> {
  await connectDB();

  if (sourceOrderId === targetOrderId) {
    throw new CannotMergeError("Can't merge an order into itself.");
  }

  const [source, target] = await Promise.all([
    Order.findOne({ _id: sourceOrderId, restaurantId }),
    Order.findOne({ _id: targetOrderId, restaurantId }),
  ]);
  if (!source) throw new OrderNotFoundError("source");
  if (!target) throw new OrderNotFoundError("target");

  for (const order of [source, target]) {
    if (["served", "cancelled"].includes(order.status)) {
      throw new CannotMergeError("Both orders must still be active (not served or cancelled).");
    }
  }

  const sourceTableId = source.tableId;
  const targetTableId = target.tableId;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    target.items.push(...source.items);
    const totals = calculateOrderTotals(target.items, target.discountTotal);
    target.subtotal = totals.subtotal;
    target.taxTotal = totals.taxTotal;
    target.total = totals.total;
    await target.save({ session });

    source.status = "cancelled";
    source.mergedIntoOrderId = target._id;
    await source.save({ session });

    // Free the source's table (if it had one, and it isn't the same table
    // the target is already sitting at).
    if (sourceTableId && (!targetTableId || !sourceTableId.equals(targetTableId))) {
      await Table.updateOne(
        { _id: sourceTableId, activeOrderId: source._id },
        { status: "empty", activeOrderId: null },
        { session }
      );
    }

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }

  publishOrderEvent(restaurantId, { type: "order.updated", order: target });
  publishOrderEvent(restaurantId, { type: "order.updated", order: source });

  return { target, source };
}
