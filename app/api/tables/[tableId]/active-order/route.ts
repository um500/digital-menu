import { NextResponse } from "next/server";

import { getOpenOrderForTable } from "@/lib/orders/join-table-order";

/**
 * Public — checked at checkout, before a customer places an order, so they
 * can be offered "add to the table's open order" instead of the kitchen
 * getting a second ticket for the same table. Same trust level as POST
 * /api/orders itself (tableId alone, no re-signed link): it only reveals an
 * order number and item count, nothing a diner at that table couldn't
 * already see on the printed/handed-back bill.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ tableId: string }> }
) {
  const { tableId } = await params;
  const { searchParams } = new URL(req.url);
  const restaurantId = searchParams.get("r");

  if (!restaurantId) {
    return NextResponse.json({ error: "Missing restaurant id" }, { status: 400 });
  }

  const openOrder = await getOpenOrderForTable(tableId, restaurantId);
  return NextResponse.json({ openOrder });
}
