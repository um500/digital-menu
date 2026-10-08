/** 1 point earned per ₹10 spent (on the final, post-discount order total). */
export const LOYALTY_RUPEES_PER_POINT_EARNED = 10;

/** 1 point redeems for ₹1 of discount. */
export const LOYALTY_POINT_VALUE_RUPEES = 1;

/** A single order can't wipe out more than this % of its own subtotal+tax with points. */
export const LOYALTY_MAX_REDEEM_PERCENT = 50;

export function pointsEarnedForAmount(amountPaid: number): number {
  return Math.floor(amountPaid / LOYALTY_RUPEES_PER_POINT_EARNED);
}

export function rupeesForPoints(points: number): number {
  return points * LOYALTY_POINT_VALUE_RUPEES;
}
