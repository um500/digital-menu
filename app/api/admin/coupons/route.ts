import { NextResponse } from "next/server";

import { requireAdmin, UnauthorizedError } from "@/lib/auth/guards";
import { createCoupon, listCoupons, DuplicateCouponError } from "@/lib/coupons/coupon-admin";
import { serializeCoupon } from "@/lib/coupons/serialize-coupon";
import { createCouponSchema } from "@/lib/validations/coupon";

export async function GET() {
  try {
    const session = await requireAdmin();
    const coupons = await listCoupons(session.restaurantId);
    return NextResponse.json({ coupons: coupons.map(serializeCoupon) });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw err;
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json().catch(() => null);
    const parsed = createCouponSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid coupon" },
        { status: 400 }
      );
    }

    const coupon = await createCoupon(session.restaurantId, parsed.data);
    return NextResponse.json({ coupon: serializeCoupon(coupon) }, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof DuplicateCouponError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
}
