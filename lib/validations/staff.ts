import { z } from "zod";

export const createStaffSchema = z.object({
  name: z.string().trim().min(1).max(60),
  pin: z.string().regex(/^[0-9]{4,6}$/, "PIN must be 4-6 digits"),
  role: z.enum(["waiter", "kitchen", "cashier"]),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;

export const updateStaffSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  pin: z.string().regex(/^[0-9]{4,6}$/, "PIN must be 4-6 digits").optional(),
  role: z.enum(["waiter", "kitchen", "cashier"]).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;

export const verifyPinSchema = z.object({
  pin: z.string().regex(/^[0-9]{4,6}$/),
});
