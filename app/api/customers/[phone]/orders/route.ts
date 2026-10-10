import { NextResponse } from "next/server";

import { DEMO_RESTAURANT_ID } from "@/config/restaurant";
import { getOrdersByPhone } from "@/lib/orders/get-order";

/**
 * Public — "My orders" on the menu page, keyed by the phone number entered
 * at the welcome gate. Same trust level as /api/customers/lookup (no OTP in
 * this build — the phone number itself is the account).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ phone: string }> }
) {
  const { phone } = await params;

  if (!/^[0-9]{10}$/.test(phone)) {
    return NextResponse.json({ error: "A 10-digit phone number is required" }, { status: 400 });
  }

  const orders = await getOrdersByPhone(DEMO_RESTAURANT_ID, phone);
  return NextResponse.json({ orders });
}
