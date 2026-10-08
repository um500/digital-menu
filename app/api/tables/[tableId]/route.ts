import { NextResponse } from "next/server";

import { getTableFromSignedLink, InvalidTableLinkError } from "@/lib/tables/get-tables";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ tableId: string }> }
) {
  const { tableId } = await params;
  const { searchParams } = new URL(req.url);
  const restaurantId = searchParams.get("r");
  const sig = searchParams.get("sig");

  if (!restaurantId || !sig) {
    return NextResponse.json({ error: "Missing link parameters" }, { status: 400 });
  }

  try {
    const table = await getTableFromSignedLink(tableId, restaurantId, sig);
    return NextResponse.json({
      table: {
        _id: table._id.toString(),
        label: table.label,
        restaurantId: table.restaurantId,
        status: table.status,
      },
    });
  } catch (err) {
    if (err instanceof InvalidTableLinkError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    throw err;
  }
}
