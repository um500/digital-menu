import { NextResponse } from "next/server";

import { requireAdmin, UnauthorizedError } from "@/lib/auth/guards";
import { getOrCreateSettings, updateSettings } from "@/lib/settings/settings-admin";
import { updateSettingsSchema } from "@/lib/validations/settings";

export async function GET() {
  try {
    const session = await requireAdmin();
    const settings = await getOrCreateSettings(session.restaurantId);
    return NextResponse.json({ settings });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw err;
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json().catch(() => null);
    const parsed = updateSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid settings" },
        { status: 400 }
      );
    }

    const settings = await updateSettings(session.restaurantId, parsed.data);
    return NextResponse.json({ settings });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw err;
  }
}
