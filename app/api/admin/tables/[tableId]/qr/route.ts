import { NextResponse } from "next/server";

import { requireAdmin, UnauthorizedError } from "@/lib/auth/guards";
import { generateTableQr } from "@/lib/qr/qr-image";
import { getTableForAdmin, TableNotFoundError } from "@/lib/tables/table-admin";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ tableId: string }> }
) {
  try {
    const session = await requireAdmin();
    const { tableId } = await params;

    // Confirm the table belongs to this admin's restaurant before signing a
    // QR for it — otherwise a bad tableId would still produce a QR that's
    // guaranteed to fail verification when scanned.
    await getTableForAdmin(session.restaurantId, tableId);

    const { searchParams } = new URL(req.url);
    const baseUrl = searchParams.get("baseUrl") ?? new URL(req.url).origin;

    const { url, dataUrl } = await generateTableQr(baseUrl, tableId, session.restaurantId);
    return NextResponse.json({ url, dataUrl });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof TableNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    throw err;
  }
}
