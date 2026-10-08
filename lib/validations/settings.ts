import { z } from "zod";

export const updateSettingsSchema = z.object({
  restaurantName: z.string().trim().min(1).max(100),
  gstNumber: z.string().trim().max(20).optional().or(z.literal("")),
  gstPercent: z.number().min(0).max(28),
  paymentMethods: z.object({
    online: z.boolean(),
    cash: z.boolean(),
    card: z.boolean(),
    mealVoucher: z.boolean(),
    corporateBilling: z.boolean(),
  }),
  loyaltyEnabled: z.boolean(),
  googleReviewLink: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || /^https?:\/\//i.test(v), "Must be a full https:// link")
    .optional()
    .or(z.literal("")),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
