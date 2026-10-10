import "server-only";

import { connectDB } from "@/lib/db/connect";
import { Table, type ITable } from "@/lib/db/models/Table";
import { publishOrderEvent } from "@/lib/realtime/order-events";

export class TableNotFoundError extends Error {
  constructor() {
    super("Table not found.");
  }
}

export class WaiterAlreadyCalledError extends Error {
  constructor() {
    super("A waiter has already been notified for this table.");
  }
}

/**
 * Customer-side — raised straight from the menu page, before any order
 * exists (e.g. to ask about an allergen, or just to place an order the
 * old-fashioned way). Separate from Order.waiterCallAt, which only makes
 * sense once an order is placed. Atomic the same way: only sets it if it's
 * currently null, so repeated taps can't spam the admin dashboard.
 */
export async function raiseTableWaiterCall(tableId: string, restaurantId: string): Promise<ITable> {
  await connectDB();

  const table = await Table.findOneAndUpdate(
    { _id: tableId, restaurantId, waiterCallAt: null },
    { $set: { waiterCallAt: new Date() } },
    { new: true }
  );

  if (!table) {
    const exists = await Table.exists({ _id: tableId, restaurantId });
    throw exists ? new WaiterAlreadyCalledError() : new TableNotFoundError();
  }

  publishOrderEvent(restaurantId, { type: "table.waiterCall", table });
  return table;
}

/** Admin-side — acknowledges and clears the call so the table can raise another one later. */
export async function acknowledgeTableWaiterCall(tableId: string, restaurantId: string): Promise<ITable> {
  await connectDB();

  const table = await Table.findOneAndUpdate(
    { _id: tableId, restaurantId },
    { $set: { waiterCallAt: null } },
    { new: true }
  );
  if (!table) throw new TableNotFoundError();

  publishOrderEvent(restaurantId, { type: "table.waiterCall", table });
  return table;
}
