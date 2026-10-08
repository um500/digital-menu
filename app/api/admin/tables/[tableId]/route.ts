import { NextResponse } from "next/server";

import { requireAdmin, UnauthorizedError } from "@/lib/auth/guards";
import {
  deleteTable,
  updateTable,
  DuplicateTableError,
  TableInUseError,
  TableNotFoundError,
} from "@/lib/tables/table-admin";
import { updateTableSchema } from "@/lib/validations/table";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ tableId: string }> }
) {
  try {
    const session = await requireAdmin();
    const { tableId } = await params;
    const body = await req.json().catch(() => null);
    const parsed = updateTableSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid update" },
        { status: 400 }
      );
    }

    const table = await updateTable(session.restaurantId, tableId, parsed.data);
    return NextResponse.json({ table });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof TableNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err instanceof DuplicateTableError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ tableId: string }> }
) {
  try {
    const session = await requireAdmin();
    const { tableId } = await params;
    await deleteTable(session.restaurantId, tableId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof TableNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err instanceof TableInUseError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
}
