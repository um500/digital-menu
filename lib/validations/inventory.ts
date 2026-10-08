import { z } from "zod";

export const updateInventorySchema = z.object({
  menuItemName: z.string().min(1),
  trackStock: z.boolean(),
  stockQuantity: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0),
});

export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
