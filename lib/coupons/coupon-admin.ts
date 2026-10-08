import "server-only";

import { connectDB } from "@/lib/db/connect";
import { Coupon, type ICoupon } from "@/lib/db/models/Coupon";
import type { CreateCouponInput, UpdateCouponInput } from "@/lib/validations/coupon";

export class DuplicateCouponError extends Error {
  constructor(code: string) {
    super(`A coupon with code "${code.toUpperCase()}" already exists.`);
  }
}

export class CouponNotFoundError extends Error {
  constructor() {
    super("Coupon not found.");
  }
}

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code: unknown }).code === 11000;
}

export async function listCoupons(restaurantId: string): Promise<ICoupon[]> {
  await connectDB();
  return Coupon.find({ restaurantId }).sort({ createdAt: -1 });
}

export async function createCoupon(restaurantId: string, input: CreateCouponInput): Promise<ICoupon> {
  await connectDB();
  try {
    return await Coupon.create({
      restaurantId,
      code: input.code.toUpperCase().trim(),
      type: input.type,
      value: input.value,
      minOrderAmount: input.minOrderAmount,
      maxDiscount: input.maxDiscount ?? null,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      usageLimit: input.usageLimit ?? null,
      isActive: input.isActive,
    });
  } catch (err) {
    if (isDuplicateKeyError(err)) throw new DuplicateCouponError(input.code);
    throw err;
  }
}

export async function updateCoupon(
  restaurantId: string,
  couponId: string,
  input: UpdateCouponInput
): Promise<ICoupon> {
  await connectDB();

  const update: Record<string, unknown> = { ...input };
  if (input.code) update.code = input.code.toUpperCase().trim();
  if (input.expiresAt !== undefined) {
    update.expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
  }

  try {
    const coupon = await Coupon.findOneAndUpdate(
      { _id: couponId, restaurantId },
      { $set: update },
      { new: true }
    );
    if (!coupon) throw new CouponNotFoundError();
    return coupon;
  } catch (err) {
    if (isDuplicateKeyError(err)) throw new DuplicateCouponError(String(input.code));
    throw err;
  }
}

export async function deleteCoupon(restaurantId: string, couponId: string): Promise<void> {
  await connectDB();
  const result = await Coupon.deleteOne({ _id: couponId, restaurantId });
  if (result.deletedCount === 0) throw new CouponNotFoundError();
}
