import mongoose, { Schema, type Document, type Model } from "mongoose";

export type CouponType = "percent" | "flat";

export interface ICoupon extends Document {
  restaurantId: string;
  code: string; // stored uppercase
  type: CouponType;
  value: number; // % (0-100) for "percent", rupees for "flat"
  minOrderAmount: number;
  maxDiscount?: number | null; // caps a "percent" coupon's rupee discount; ignored for "flat"
  expiresAt?: Date | null;
  usageLimit?: number | null; // null = unlimited
  usedCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    restaurantId: { type: String, required: true, index: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percent", "flat"], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, required: true, default: 0 },
    maxDiscount: { type: Number, default: null },
    expiresAt: { type: Date, default: null },
    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

CouponSchema.index({ restaurantId: 1, code: 1 }, { unique: true });

export const Coupon: Model<ICoupon> =
  mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);

export default Coupon;
