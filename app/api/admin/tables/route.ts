import { NextResponse } from "next/server";

import { requireAdmin, UnauthorizedError } from "@/lib/auth/guards";
import { createTable, listTables, DuplicateTableError } from "@/lib/tables/table-admin";
import { createTableSchema } from "@/lib/validations/table";

export async function GET() {
  try {
    const session = await requireAdmin();
    const tables = await listTables(session.restaurantId);
    return NextResponse.json({ tables });
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
    const parsed = createTableSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid table" },
        { status: 400 }
      );
    }

    const table = await createTable(session.restaurantId, parsed.data);
    return NextResponse.json({ table }, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof DuplicateTableError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
}
