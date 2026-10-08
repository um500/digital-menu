import "server-only";

import crypto from "node:crypto";

import Razorpay from "razorpay";

/**
 * Lazily constructed so a missing key pair only breaks the payment flow
 * when it's actually used, not at import time for every route that
 * happens to import this module (e.g. order creation, which doesn't need
 * Razorpay unless the customer picks "pay online").
 */
let client: Razorpay | null = null;

function getClient(): Razorpay {
  if (client) return client;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET).");
  }

  client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return client;
}

export interface RazorpayOrderResult {
  razorpayOrderId: string;
  amount: number; // paise
  currency: string;
}

/**
 * Creates a Razorpay Order for the given rupee amount. This is distinct
 * from our own Order document — it's Razorpay's own record of "a payment
 * for this much is expected", keyed by `receipt` (our order's _id) so it
 * shows up tied to the right order in the Razorpay dashboard.
 */
export async function createRazorpayOrder(
  amountRupees: number,
  receipt: string
): Promise<RazorpayOrderResult> {
  const amount = Math.round(amountRupees * 100); // Razorpay works in paise
  const order = await getClient().orders.create({
    amount,
    currency: "INR",
    receipt,
  });

  return { razorpayOrderId: order.id, amount, currency: order.currency };
}

/**
 * Verifies the HMAC-SHA256 signature Razorpay's checkout handler hands
 * back after a successful payment, per their documented scheme:
 * signature == HMAC_SHA256(razorpayOrderId + "|" + razorpayPaymentId, key_secret).
 * Never trust a client-reported "payment succeeded" without this check —
 * the handler callback runs in the customer's browser and could be forged.
 */
export function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error("Razorpay is not configured (RAZORPAY_KEY_SECRET).");
  }

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(signature, "hex");
  if (expectedBuf.length !== actualBuf.length) return false;

  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}
