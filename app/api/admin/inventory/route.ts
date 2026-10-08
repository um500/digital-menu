import { NextResponse } from "next/server";

import { requireAdmin, UnauthorizedError } from "@/lib/auth/guards";
import { listInventory } from "@/lib/inventory/inventory-admin";

export async function GET() {
  try {
    const session = await requireAdmin();
    const rows = await listInventory(session.restaurantId);
    return NextResponse.json({ rows });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw err;
  }
}
