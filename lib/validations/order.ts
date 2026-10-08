import { z } from "zod";

export const createOrderSchema = z.object({
  restaurantId: z.string().min(1),
  tableId: z.string().optional(), // absent => takeaway/counter order with no table
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1),
        quantity: z.number().int().min(1).max(50),
        notes: z.string().max(200).optional(),
      })
    )
    .min(1, "Cart is empty"),
  customerName: z.string().max(80).optional(),
  customerPhone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone must be 10 digits")
    .optional(),
  notes: z.string().max(300).optional(),
  couponCode: z.string().trim().min(1).max(20).optional(),
  // Points the customer wants to redeem — re-validated server-side against
  // their actual balance; this number alone is never trusted as a discount.
  redeemPoints: z.number().int().min(0).max(100000).optional(),
  // Set when a counter staff member (clocked in via PIN) places this order
  // on the admin's behalf; absent for customer self-serve QR orders.
  staffName: z.string().trim().min(1).max(60).optional(),
  // How the customer intends to pay. "online" kicks off the Razorpay flow
  // on the order status page; the others are settled in person and simply
  // recorded, same as before Phase 6. Defaults to "manual" (the original
  // placeholder) when omitted, so existing callers are unaffected.
  paymentMethod: z.enum(["online", "cash", "card", "manual"]).optional(),
  // Who's placing this order — the public QR checkout never sets this
  // (createOrder falls back to inferring it from tableId); only
  // /admin/counter sets it explicitly to "counter", since a counter order
  // can have a tableId too (dine-in assigned at the counter) and would
  // otherwise be mis-inferred as a QR order. See createOrder for why this
  // matters for the cash/card approval gate.
  source: z.enum(["qr", "counter"]).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(["placed", "accepted", "preparing", "ready", "served", "cancelled"]),
  staffName: z.string().trim().min(1).max(60).optional(),
});

export const transferOrderSchema = z.object({
  toTableId: z.string().min(1),
});

export const mergeOrdersSchema = z.object({
  sourceOrderId: z.string().min(1),
  targetOrderId: z.string().min(1),
});

export const submitFeedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
});

export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>;
