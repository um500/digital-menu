import { NextResponse } from "next/server";

import { requireAdmin, UnauthorizedError } from "@/lib/auth/guards";
import { createStaff, listStaff } from "@/lib/staff/staff-admin";
import { createStaffSchema } from "@/lib/validations/staff";

export async function GET() {
  try {
    const session = await requireAdmin();
    const staff = await listStaff(session.restaurantId);
    // Never send pinHash to the client.
    return NextResponse.json({
      staff: staff.map((s) => ({ _id: s._id, name: s.name, role: s.role, isActive: s.isActive })),
    });
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
    const parsed = createStaffSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid staff member" },
        { status: 400 }
      );
    }

    const staff = await createStaff(session.restaurantId, parsed.data);
    return NextResponse.json(
      { staff: { _id: staff._id, name: staff.name, role: staff.role, isActive: staff.isActive } },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw err;
  }
}
