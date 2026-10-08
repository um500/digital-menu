import "server-only";

import { connectDB } from "@/lib/db/connect";
import { Inventory } from "@/lib/db/models/Inventory";
import { findSampleMenuItem, SAMPLE_MENU } from "@/lib/menu/sample-menu";
import { sanityClient } from "@/lib/sanity/client";
import { MENU_ITEM_QUERY, MENU_QUERY } from "@/lib/sanity/queries";
import type { MenuCategory, MenuItem } from "@/types/menu";

/**
 * Menu *content* (name, price, description) comes from Sanity; stock is
 * operational data that lives in Mongo (see lib/db/models/Inventory.ts).
 * This folds the two together so every caller just sees one `isAvailable`
 * flag — an item that's tracked and out of stock looks identical to one an
 * admin toggled off in Sanity, from the customer's point of view.
 *
 * Falls back to `SAMPLE_MENU` when a restaurant has no real categories in
 * Sanity yet, so the app never shows an empty menu before Studio has been
 * touched. The instant a real `category` document exists for this
 * restaurantId, this stops being used — see the length check below.
 */
export async function getMenu(restaurantId: string): Promise<MenuCategory[]> {
  const [sanityCategories] = await Promise.all([
    sanityClient.fetch<MenuCategory[]>(MENU_QUERY, { restaurantId }),
    connectDB(),
  ]);

  const categories = sanityCategories.length > 0 ? sanityCategories : SAMPLE_MENU;

  const trackedOutOfStock = await Inventory.find({
    restaurantId,
    trackStock: true,
    stockQuantity: { $lte: 0 },
  }).select("menuItemId");
  const outOfStockIds = new Set(trackedOutOfStock.map((doc) => doc.menuItemId));

  if (outOfStockIds.size === 0) return categories;

  return categories.map((category) => ({
    ...category,
    items: category.items.map((item) =>
      outOfStockIds.has(item._id) ? { ...item, isAvailable: false } : item
    ),
  }));
}

/**
 * Used when creating an order: we trust Sanity's current price/availability,
 * never whatever the client sent us, and snapshot it onto the order. Falls
 * back to the same `SAMPLE_MENU` prices for a `sample-` prefixed ID — those
 * IDs can only ever come from the sample menu itself (never from a real
 * Sanity document), so this never lets a client-supplied ID resolve to a
 * price we didn't set ourselves.
 */
export async function getMenuItemForOrder(
  restaurantId: string,
  menuItemId: string
): Promise<Pick<MenuItem, "_id" | "name" | "price" | "taxPercent" | "isAvailable"> | null> {
  const realItem = await sanityClient.fetch<Pick<
    MenuItem,
    "_id" | "name" | "price" | "taxPercent" | "isAvailable"
  > | null>(MENU_ITEM_QUERY, { restaurantId, menuItemId });

  if (realItem) return realItem;
  return findSampleMenuItem(menuItemId);
}
