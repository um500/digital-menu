import "server-only";

import type { ClientSession } from "mongoose";

import { Inventory } from "@/lib/db/models/Inventory";
import type { IOrderItem } from "@/lib/db/models/Order";

export class OutOfStockError extends Error {
  constructor(public itemName: string) {
    super(`${itemName} just went out of stock.`);
  }
}

/**
 * Must run inside the same transaction as the order it belongs to (see
 * lib/orders/create-order.ts) — decrementing stock after the order is
 * already committed would let two concurrent orders both succeed against
 * the same last unit. Items with no Inventory doc, or trackStock=false,
 * are skipped entirely (stock tracking is opt-in per item).
 */
export async function reserveStockForOrder(
  session: ClientSession,
  restaurantId: string,
  items: IOrderItem[]
): Promise<void> {
  for (const item of items) {
    const updated = await Inventory.findOneAndUpdate(
      {
        restaurantId,
        menuItemId: item.menuItemId,
        trackStock: true,
        stockQuantity: { $gte: item.quantity },
      },
      { $inc: { stockQuantity: -item.quantity } },
      { session }
    );

    if (!updated) {
      // Either there's no tracked Inventory doc (nothing to reserve, fine),
      // or there is one but it didn't have enough stock (not fine).
      const tracked = await Inventory.findOne({ restaurantId, menuItemId: item.menuItemId, trackStock: true }).session(
        session
      );
      if (tracked) throw new OutOfStockError(item.name);
    }
  }
}
