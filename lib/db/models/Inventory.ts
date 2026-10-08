import mongoose, { Schema, type Document, type Model } from "mongoose";

/**
 * Item-level stock tracking (not ingredient/recipe-level — that's a much
 * bigger feature). One record per (restaurantId, menuItemId), menuItemId
 * being the Sanity menuItem's _id. Menu *content* stays in Sanity by design;
 * this is purely operational data, so it lives in Mongo like orders do.
 * A menu item with no Inventory doc, or trackStock=false, is always
 * orderable — stock tracking is opt-in per item.
 */
export interface IInventory extends Document {
  restaurantId: string;
  menuItemId: string;
  menuItemName: string; // cached so the admin list doesn't need a second Sanity round-trip
  trackStock: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    restaurantId: { type: String, required: true, index: true },
    menuItemId: { type: String, required: true },
    menuItemName: { type: String, required: true },
    trackStock: { type: Boolean, required: true, default: false },
    stockQuantity: { type: Number, required: true, default: 0, min: 0 },
    lowStockThreshold: { type: Number, required: true, default: 5 },
  },
  { timestamps: true }
);

InventorySchema.index({ restaurantId: 1, menuItemId: 1 }, { unique: true });

export const Inventory: Model<IInventory> =
  mongoose.models.Inventory || mongoose.model<IInventory>("Inventory", InventorySchema);

export default Inventory;
