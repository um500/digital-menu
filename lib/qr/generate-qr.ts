import "server-only";

import crypto from "node:crypto";

if (!process.env.QR_SECRET) {
  throw new Error("QR_SECRET is missing. Add it to .env.local (see .env.example).");
}

// Narrowed once here; captured as a guaranteed string in the closures below.
const secret: string = process.env.QR_SECRET;

/**
 * Signs (tableId, restaurantId) so a printed QR's URL can't be hand-edited
 * to point at another table or another restaurant's table. The signature is
 * short (16 hex chars) so the QR stays scannable at small print sizes.
 */
export function signTable(tableId: string, restaurantId: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(`${tableId}:${restaurantId}`)
    .digest("hex")
    .slice(0, 16);
}

export function verifyTableSignature(
  tableId: string,
  restaurantId: string,
  signature: string
): boolean {
  const expected = signTable(tableId, restaurantId);
  // Constant-time compare — avoids leaking the correct signature one byte at
  // a time through response-timing differences.
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
