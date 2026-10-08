import "server-only";

import type { ClientSession } from "mongoose";

import { connectDB } from "@/lib/db/connect";
import { Coupon, type ICoupon } from "@/lib/db/models/Coupon";

export class InvalidCouponError extends Error {}

/**
 * Re-validated here on every order, never trusting a discount amount the
 * client might send — same pricing-integrity rule as menu item prices.
 * billableAmount is subtotal+tax (before any discount) since that's the
 * base a % coupon applies against.
 */
export async function resolveCouponDiscount(
  restaurantId: string,
  code: string,
  billableAmount: number
): Promise<{ coupon: ICoupon; discount: number }> {
  await connectDB();

  const coupon = await Coupon.findOne({ restaurantId, code: code.toUpperCase().trim() });

  if (!coupon || !coupon.isActive) throw new InvalidCouponError("Invalid coupon code.");
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    throw new InvalidCouponError("This coupon has expired.");
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    throw new InvalidCouponError("This coupon has reached its usage limit.");
  }
  if (billableAmount < coupon.minOrderAmount) {
    throw new InvalidCouponError(`This coupon needs a minimum order of ₹${coupon.minOrderAmount}.`);
  }

  let discount = coupon.type === "flat" ? coupon.value : (billableAmount * coupon.value) / 100;
  if (coupon.type === "percent" && coupon.maxDiscount != null) {
    discount = Math.min(discount, coupon.maxDiscount);
  }
  discount = Math.min(discount, billableAmount); // never discount more than the bill itself

  return { coupon, discount: Math.round(discount) };
}

/**
 * Must run inside the same transaction as the order it belongs to. Re-checks
 * the usage limit atomically — the resolve step above is only a fast-fail
 * for the happy path, since usage could tick up between resolve and commit.
 */
export async function commitCouponUsage(session: ClientSession, coupon: ICoupon): Promise<void> {
  const filter =
    coupon.usageLimit != null
      ? { _id: coupon._id, usedCount: { $lt: coupon.usageLimit } }
      : { _id: coupon._id };

  const result = await Coupon.updateOne(filter, { $inc: { usedCount: 1 } }, { session });
  if (result.matchedCount === 0) {
    throw new InvalidCouponError("This coupon has just reached its usage limit.");
  }
}
