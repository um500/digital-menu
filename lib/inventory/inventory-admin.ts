import "server-only";

import { connectDB } from "@/lib/db/connect";
import { Inventory, type IInventory } from "@/lib/db/models/Inventory";
import { getMenu } from "@/lib/menu/get-menu";

export interface InventoryRow {
  menuItemId: string;
  menuItemName: string;
  categoryName: string;
  price: number;
  trackStock: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
}

/** One row per Sanity menu item, joined with its Mongo Inventory doc (if any). Untracked items default to trackStock=false. */
export async function listInventory(restaurantId: string): Promise<InventoryRow[]> {
  const [categories] = await Promise.all([getMenu(restaurantId), connectDB()]);
  const inventoryDocs = await Inventory.find({ restaurantId });
  const byMenuItemId = new Map(inventoryDocs.map((doc) => [doc.menuItemId, doc]));

  const rows: InventoryRow[] = [];
  for (const category of categories) {
    for (const item of category.items) {
      const inv = byMenuItemId.get(item._id);
      rows.push({
        menuItemId: item._id,
        menuItemName: item.name,
        categoryName: category.name,
        price: item.price,
        trackStock: inv?.trackStock ?? false,
        stockQuantity: inv?.stockQuantity ?? 0,
        lowStockThreshold: inv?.lowStockThreshold ?? 5,
      });
    }
  }
  return rows;
}

export async function upsertInventory(
  restaurantId: string,
  menuItemId: string,
  menuItemName: string,
  input: { trackStock: boolean; stockQuantity: number; lowStockThreshold: number }
): Promise<IInventory> {
  await connectDB();

  return Inventory.findOneAndUpdate(
    { restaurantId, menuItemId },
    {
      $set: {
        menuItemName,
        trackStock: input.trackStock,
        stockQuantity: input.stockQuantity,
        lowStockThreshold: input.lowStockThreshold,
      },
    },
    { new: true, upsert: true }
  );
}
