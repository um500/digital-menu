export interface InventoryRowView {
  menuItemId: string;
  menuItemName: string;
  categoryName: string;
  price: number;
  trackStock: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
}
