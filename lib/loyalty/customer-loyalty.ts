import "server-only";

import type { ClientSession } from "mongoose";

import { connectDB } from "@/lib/db/connect";
import { Customer } from "@/lib/db/models/Customer";
import { pointsEarnedForAmount } from "@/lib/constants/loyalty";

export class InsufficientPointsError extends Error {
  constructor() {
    super("Not enough loyalty points for that redemption.");
  }
}

/** Public-safe lookup used at checkout to show "You have N points" before placing the order. */
export async function getLoyaltySummary(
  restaurantId: string,
  phone: string
): Promise<{ name?: string; loyaltyPoints: number } | null> {
  await connectDB();
  const customer = await Customer.findOne({ restaurantId, phone }).select("name loyaltyPoints");
  if (!customer) return null;
  return { name: customer.name, loyaltyPoints: customer.loyaltyPoints };
}

/** Read-only pre-check so create-order can reject an over-redemption before computing totals. */
export async function hasEnoughPoints(
  restaurantId: string,
  phone: string,
  redeemPoints: number
): Promise<boolean> {
  if (redeemPoints <= 0) return true;
  await connectDB();
  const customer = await Customer.findOne({ restaurantId, phone }).select("loyaltyPoints");
  return !!customer && customer.loyaltyPoints >= redeemPoints;
}

/**
 * Commits the point earn/redeem for one order. Must run inside the same
 * transaction as the Order.create() it belongs to (see lib/orders/create-order.ts)
 * so a crash between "order created" and "points updated" can't happen.
 * The redeemPoints>=balance guard is re-checked here atomically — the
 * earlier hasEnoughPoints() read is only a fast-fail for the happy path.
 */
export async function commitLoyaltyForOrder(
  session: ClientSession,
  params: {
    restaurantId: string;
    phone?: string;
    name?: string;
    amountPaid: number;
    redeemPoints: number;
    loyaltyEnabled?: boolean;
  }
): Promise<{ pointsEarned: number; pointsRedeemed: number }> {
  const { restaurantId, phone, name, amountPaid, redeemPoints, loyaltyEnabled = true } = params;

  if (!phone) {
    if (redeemPoints > 0) throw new Error("A phone number is required to redeem loyalty points.");
    return { pointsEarned: 0, pointsRedeemed: 0 };
  }

  // Order-count/spend tracking on the Customer record still happens even
  // when this restaurant has turned the points program off — only the
  // point accrual itself is skipped.
  const pointsEarned = loyaltyEnabled ? pointsEarnedForAmount(amountPaid) : 0;
  const netChange = pointsEarned - redeemPoints;

  if (redeemPoints > 0) {
    const updated = await Customer.findOneAndUpdate(
      { restaurantId, phone, loyaltyPoints: { $gte: redeemPoints } },
      {
        $inc: { loyaltyPoints: netChange, totalOrders: 1, totalSpent: amountPaid },
        ...(name ? { $set: { name } } : {}),
      },
      { new: true, session }
    );
    if (!updated) throw new InsufficientPointsError();
  } else {
    await Customer.findOneAndUpdate(
      { restaurantId, phone },
      {
        $inc: { loyaltyPoints: netChange, totalOrders: 1, totalSpent: amountPaid },
        ...(name ? { $set: { name } } : {}),
        $setOnInsert: { restaurantId, phone },
      },
      { upsert: true, session }
    );
  }

  return { pointsEarned, pointsRedeemed: redeemPoints };
}
