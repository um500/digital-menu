import { z } from "zod";

export const createCouponSchema = z.object({
  code: z.string().trim().min(3).max(20),
  type: z.enum(["percent", "flat"]),
  value: z.number().min(0),
  minOrderAmount: z.number().min(0).default(0),
  maxDiscount: z.number().min(0).optional(),
  expiresAt: z.string().datetime().optional().or(z.literal("")),
  usageLimit: z.number().int().min(1).optional(),
  isActive: z.boolean().default(true),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;

export const updateCouponSchema = createCouponSchema.partial();
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
