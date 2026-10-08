import { NextResponse } from "next/server";

import { requireAdmin, UnauthorizedError } from "@/lib/auth/guards";
import { verifyStaffPin } from "@/lib/staff/verify-pin";
import { verifyPinSchema } from "@/lib/validations/staff";

/**
 * Called from an already admin-authenticated shared device (kitchen tablet,
 * counter terminal) to identify WHICH staff member is acting, not to log
 * into the device itself — the device's own session is the admin cookie.
 */
export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json().catch(() => null);
    const parsed = verifyPinSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 400 });
    }

    const staff = await verifyStaffPin(session.restaurantId, parsed.data.pin);
    if (!staff) {
      return NextResponse.json({ error: "PIN not recognized" }, { status: 404 });
    }

    return NextResponse.json({ staff });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw err;
  }
}
