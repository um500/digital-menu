import { NextResponse } from "next/server";

import { requireAdmin, UnauthorizedError } from "@/lib/auth/guards";
import { listAdminMenu } from "@/lib/menu/menu-admin";

export async function GET() {
  try {
    const session = await requireAdmin();
    const { categories, items } = await listAdminMenu(session.restaurantId);
    return NextResponse.json({ categories, items });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw err;
  }
}
