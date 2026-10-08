import { NextResponse } from "next/server";

import { requireAdmin, UnauthorizedError } from "@/lib/auth/guards";
import { deleteStaff, StaffNotFoundError, updateStaff } from "@/lib/staff/staff-admin";
import { updateStaffSchema } from "@/lib/validations/staff";

export async function PATCH(req: Request, { params }: { params: Promise<{ staffId: string }> }) {
  const { staffId } = await params;
  try {
    const session = await requireAdmin();
    const body = await req.json().catch(() => null);
    const parsed = updateStaffSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid update" },
        { status: 400 }
      );
    }

    const staff = await updateStaff(session.restaurantId, staffId, parsed.data);
    return NextResponse.json({
      staff: { _id: staff._id, name: staff.name, role: staff.role, isActive: staff.isActive },
    });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof StaffNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    throw err;
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ staffId: string }> }) {
  const { staffId } = await params;
  try {
    const session = await requireAdmin();
    await deleteStaff(session.restaurantId, staffId);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof StaffNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    throw err;
  }
}
