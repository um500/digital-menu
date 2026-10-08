import { NextResponse } from "next/server";

import { DEMO_RESTAURANT_ID } from "@/config/restaurant";
import { getLoyaltySummary } from "@/lib/loyalty/customer-loyalty";

/**
 * Public — used at checkout to show "You have N points" before the order is
 * placed. Only ever returns name + points balance, never anything else
 * about the customer, and a miss just means "no points yet" (not an error).
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");

  if (!phone || !/^[0-9]{10}$/.test(phone)) {
    return NextResponse.json({ error: "A 10-digit phone number is required" }, { status: 400 });
  }

  const summary = await getLoyaltySummary(DEMO_RESTAURANT_ID, phone);
  return NextResponse.json({ customer: summary });
}
