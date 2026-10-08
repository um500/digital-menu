import { NextResponse } from "next/server";
import { z } from "zod";

import { DEMO_RESTAURANT_ID } from "@/config/restaurant";
import { InvalidCouponError, resolveCouponDiscount } from "@/lib/coupons/validate-coupon";

const bodySchema = z.object({
  code: z.string().trim().min(1).max(20),
  // The cart's current subtotal estimate — just a preview. The real
  // discount is always recomputed from the server-priced bill when the
  // order is actually placed (see lib/orders/create-order.ts).
  estimatedAmount: z.number().min(0),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const { discount, coupon } = await resolveCouponDiscount(
      DEMO_RESTAURANT_ID,
      parsed.data.code,
      parsed.data.estimatedAmount
    );
    return NextResponse.json({ discount, type: coupon.type, value: coupon.value });
  } catch (err) {
    if (err instanceof InvalidCouponError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
