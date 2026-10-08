import { NextResponse } from "next/server";

import { requireAdmin, UnauthorizedError } from "@/lib/auth/guards";
import { createMenuItem, MenuNotFoundError } from "@/lib/menu/menu-admin";
import { createMenuItemSchema } from "@/lib/validations/menu";

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json().catch(() => null);
    const parsed = createMenuItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid menu item" },
        { status: 400 }
      );
    }

    const item = await createMenuItem(session.restaurantId, parsed.data);
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof MenuNotFoundError) {
      return NextResponse.json({ error: "That category doesn't exist." }, { status: 400 });
    }
    throw err;
  }
}
