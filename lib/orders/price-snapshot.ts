import "server-only";

import { getMenuItemForOrder } from "@/lib/menu/get-menu";
import type { IOrderItem } from "@/lib/db/models/Order";
import type { CreateOrderInput } from "@/lib/validations/order";

export class UnavailableItemError extends Error {
  constructor(public menuItemName: string) {
    super(`${menuItemName} is no longer available`);
  }
}

/**
 * Converts cart lines (menuItemId + quantity, as sent by the client) into
 * priced OrderItem snapshots, using Sanity's CURRENT price — never whatever
 * price the client's cart state claims. This is what makes the bill
 * tamper-proof against someone editing requests in devtools.
 */
export async function buildOrderItemSnapshot(
  restaurantId: string,
  cartItems: CreateOrderInput["items"]
): Promise<IOrderItem[]> {
  const snapshots: IOrderItem[] = [];

  for (const line of cartItems) {
    const menuItem = await getMenuItemForOrder(restaurantId, line.menuItemId);

    if (!menuItem) {
      throw new UnavailableItemError("An item in your cart");
    }
    if (!menuItem.isAvailable) {
      throw new UnavailableItemError(menuItem.name);
    }

    snapshots.push({
      menuItemId: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: line.quantity,
      taxPercent: menuItem.taxPercent,
      notes: line.notes,
    });
  }

  return snapshots;
}
