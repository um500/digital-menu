import { NextResponse } from "next/server";

import { requireAdmin, UnauthorizedError } from "@/lib/auth/guards";
import { upsertInventory } from "@/lib/inventory/inventory-admin";
import { updateInventorySchema } from "@/lib/validations/inventory";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ menuItemId: string }> }
) {
  try {
    const session = await requireAdmin();
    const { menuItemId } = await params;
    const body = await req.json().catch(() => null);
    const parsed = updateInventorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid update" },
        { status: 400 }
      );
    }

    const inventory = await upsertInventory(
      session.restaurantId,
      menuItemId,
      parsed.data.menuItemName,
      parsed.data
    );
    return NextResponse.json({ inventory });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw err;
  }
}
