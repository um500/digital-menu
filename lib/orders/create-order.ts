import "server-only";

import crypto from "node:crypto";

import mongoose from "mongoose";

import { connectDB } from "@/lib/db/connect";
import type { ICoupon } from "@/lib/db/models/Coupon";
import { Order, type IOrder } from "@/lib/db/models/Order";
import { Table } from "@/lib/db/models/Table";
import {
  LOYALTY_MAX_REDEEM_PERCENT,
  LOYALTY_POINT_VALUE_RUPEES,
  rupeesForPoints,
} from "@/lib/constants/loyalty";
import { commitCouponUsage, resolveCouponDiscount } from "@/lib/coupons/validate-coupon";
import { reserveStockForOrder } from "@/lib/inventory/reserve-stock";
import { commitLoyaltyForOrder, hasEnoughPoints, InsufficientPointsError } from "@/lib/loyalty/customer-loyalty";
import { publishOrderEvent } from "@/lib/realtime/order-events";
import { getOrCreateSettings } from "@/lib/settings/settings-admin";
import type { CreateOrderInput } from "@/lib/validations/order";
import { calculateOrderTotals } from "./order-calculations";
import { nextOrderNumber } from "./order-number";
import { buildOrderItemSnapshot } from "./price-snapshot";

export async function createOrder(input: CreateOrderInput): Promise<IOrder> {
  await connectDB();

  const items = await buildOrderItemSnapshot(input.restaurantId, input.items);
  const { subtotal: baseSubtotal, taxTotal: baseTaxTotal } = calculateOrderTotals(items);
  const billableAmount = baseSubtotal + baseTaxTotal;

  const settings = await getOrCreateSettings(input.restaurantId);
  const loyaltyEnabled = settings.loyaltyEnabled;

  // --- Coupon: resolved (not committed) before the transaction, so a bad
  // code fails fast without ever creating an Order document. ---
  let coupon: ICoupon | null = null;
  let couponDiscount = 0;
  if (input.couponCode) {
    const resolved = await resolveCouponDiscount(input.restaurantId, input.couponCode, billableAmount);
    coupon = resolved.coupon;
    couponDiscount = resolved.discount;
  }

  // --- Loyalty: fast-fail balance check, then cap the redemption so it
  // can't wipe out more than LOYALTY_MAX_REDEEM_PERCENT of what's left
  // after the coupon. The actual balance debit happens atomically below,
  // inside the same transaction as the order itself. ---
  let redeemPoints = loyaltyEnabled ? input.redeemPoints ?? 0 : 0;
  if (redeemPoints > 0) {
    if (!input.customerPhone) {
      throw new Error("A phone number is required to redeem loyalty points.");
    }
    const ok = await hasEnoughPoints(input.restaurantId, input.customerPhone, redeemPoints);
    if (!ok) throw new InsufficientPointsError();
  }

  const remainingAfterCoupon = Math.max(billableAmount - couponDiscount, 0);
  const maxLoyaltyDiscount = Math.floor((remainingAfterCoupon * LOYALTY_MAX_REDEEM_PERCENT) / 100);
  let loyaltyDiscount = rupeesForPoints(redeemPoints);
  if (loyaltyDiscount > maxLoyaltyDiscount) {
    loyaltyDiscount = maxLoyaltyDiscount;
    redeemPoints = Math.floor(maxLoyaltyDiscount / LOYALTY_POINT_VALUE_RUPEES);
  }

  const discountTotal = couponDiscount + loyaltyDiscount;
  const totals = calculateOrderTotals(items, discountTotal);
  const orderNumber = await nextOrderNumber(input.restaurantId);

  let tableLabel: string | null = null;
  if (input.tableId) {
    const table = await Table.findOne({ _id: input.tableId, restaurantId: input.restaurantId });
    tableLabel = table?.label ?? null;
  }

  const sessionToken = crypto.randomBytes(24).toString("hex");

  // tableId alone can't distinguish "customer scanned this table's QR" from
  // "cashier assigned this table to a counter order" — only an explicit
  // `source` (sent by /admin/counter) can. Falls back to the old
  // tableId-based inference for the public QR flow, which never sets it.
  const resolvedSource = input.source ?? (input.tableId ? "qr" : "counter");
  const paymentMethod = input.paymentMethod ?? "manual";

  // Payment-at-checkout fraud gate: a customer's own cash/card order sits as
  // "pending" until an admin manually approves it on Live Orders — it never
  // reaches the kitchen until then, so no one can order, walk off, and
  // stick the restaurant with the food. Online orders become "approved"
  // automatically once Razorpay payment is verified (see
  // lib/payments/order-payment.ts). Counter orders skip the gate entirely —
  // the staff member taking the order is physically collecting payment
  // right there, so there's nothing left to approve.
  const paymentStatus = resolvedSource === "counter" && paymentMethod !== "online" ? "approved" : "pending";

  // Order creation, the table status flip, the coupon usage increment, and
  // the loyalty balance update all happen atomically — a crash partway
  // through can't leave a priced order with no loyalty debit, or a redeemed
  // coupon with no order behind it. Requires a replica set (Atlas's default,
  // including the free tier; a bare standalone `mongod` does not support
  // transactions).
  const session = await mongoose.startSession();
  let order: IOrder;

  try {
    session.startTransaction();

    const [createdOrder] = await Order.create(
      [
        {
          restaurantId: input.restaurantId,
          orderNumber,
          sessionToken,
          tableId: input.tableId ?? null,
          tableLabel,
          source: resolvedSource,
          orderType: input.tableId ? "dine-in" : "takeaway",
          items,
          subtotal: totals.subtotal,
          taxTotal: totals.taxTotal,
          discountTotal,
          total: totals.total,
          couponCode: coupon?.code ?? null,
          loyaltyPointsRedeemed: redeemPoints,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          status: "placed",
          paymentMethod,
          paymentStatus,
          notes: input.notes,
          lastHandledByStaff: input.staffName ?? null,
          placedAt: new Date(),
        },
      ],
      { session }
    );
    order = createdOrder;

    await reserveStockForOrder(session, input.restaurantId, items);

    if (input.tableId) {
      await Table.updateOne(
        { _id: input.tableId },
        { status: "occupied", activeOrderId: order._id },
        { session }
      );
    }

    if (coupon) {
      await commitCouponUsage(session, coupon);
    }

    const { pointsEarned } = await commitLoyaltyForOrder(session, {
      restaurantId: input.restaurantId,
      phone: input.customerPhone,
      name: input.customerName,
      amountPaid: totals.total,
      redeemPoints,
      loyaltyEnabled,
    });

    order.loyaltyPointsEarned = pointsEarned;
    await order.save({ session });

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }

  publishOrderEvent(input.restaurantId, { type: "order.created", order });

  return order;
}
