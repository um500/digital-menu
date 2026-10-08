import type { ICoupon } from "@/lib/db/models/Coupon";

/**
 * Adds a server-computed `isExpired` flag before the coupon crosses the API
 * boundary. Computed here rather than in the browser so the admin's local
 * clock can't produce a wrong badge, and so the UI never calls Date.now()
 * during render (React's purity rule disallows that).
 */
export function serializeCoupon(coupon: ICoupon) {
  return {
    ...coupon.toObject(),
    isExpired: coupon.expiresAt ? coupon.expiresAt.getTime() < Date.now() : false,
  };
}
