import { NextResponse } from "next/server";

import { requireAdmin, UnauthorizedError } from "@/lib/auth/guards";
import {
  deleteCoupon,
  updateCoupon,
  CouponNotFoundError,
  DuplicateCouponError,
} from "@/lib/coupons/coupon-admin";
import { serializeCoupon } from "@/lib/coupons/serialize-coupon";
import { updateCouponSchema } from "@/lib/validations/coupon";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ couponId: string }> }
) {
  try {
    const session = await requireAdmin();
    const { couponId } = await params;
    const body = await req.json().catch(() => null);
    const parsed = updateCouponSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid update" },
        { status: 400 }
      );
    }

    const coupon = await updateCoupon(session.restaurantId, couponId, parsed.data);
    return NextResponse.json({ coupon: serializeCoupon(coupon) });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof CouponNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err instanceof DuplicateCouponError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ couponId: string }> }
) {
  try {
    const session = await requireAdmin();
    const { couponId } = await params;
    await deleteCoupon(session.restaurantId, couponId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof CouponNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    throw err;
  }
}
