import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(60),
  sortOrder: z.number().int().default(0),
});
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema.partial();
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

const imageValueSchema = z
  .object({
    _type: z.literal("image"),
    asset: z.object({
      _type: z.literal("reference"),
      _ref: z.string(),
    }),
  })
  .nullable()
  .optional();

export const createMenuItemSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  categoryId: z.string().min(1, "Choose a category"),
  price: z.number().min(0),
  taxPercent: z.number().min(0).max(100).default(5),
  foodType: z.enum(["veg", "non-veg", "egg"]).default("veg"),
  isAvailable: z.boolean().default(true),
  isBestseller: z.boolean().default(false),
  image: imageValueSchema,
});
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;

export const updateMenuItemSchema = createMenuItemSchema.partial();
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
