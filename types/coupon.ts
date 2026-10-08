export type CouponType = "percent" | "flat";

export interface CouponView {
  _id: string;
  restaurantId: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number;
  maxDiscount?: number | null;
  expiresAt?: string | null;
  usageLimit?: number | null;
  usedCount: number;
  isActive: boolean;
  /** Computed server-side at fetch time — never derive this from the client's own clock. */
  isExpired: boolean;
}
