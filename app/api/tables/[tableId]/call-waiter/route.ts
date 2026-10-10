import { NextResponse } from "next/server";

import { requireAdmin, UnauthorizedError } from "@/lib/auth/guards";
import {
  acknowledgeTableWaiterCall,
  raiseTableWaiterCall,
  TableNotFoundError,
  WaiterAlreadyCalledError,
} from "@/lib/tables/call-waiter";

/** Customer — public, no order required. Same trust level as POST /api/orders (tableId alone). */
export async function POST(req: Request, { params }: { params: Promise<{ tableId: string }> }) {
  const { tableId } = await params;
  const body = await req.json().catch(() => null);
  const restaurantId = body?.restaurantId;

  if (!restaurantId || typeof restaurantId !== "string") {
    return NextResponse.json({ error: "Missing restaurant id" }, { status: 400 });
  }

  try {
    const table = await raiseTableWaiterCall(tableId, restaurantId);
    return NextResponse.json({ waiterCallAt: table.waiterCallAt });
  } catch (err) {
    if (err instanceof TableNotFoundError) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }
    if (err instanceof WaiterAlreadyCalledError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
}

/** Admin — acknowledges and clears the call. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ tableId: string }> }) {
  try {
    const session = await requireAdmin();
    const { tableId } = await params;
    const table = await acknowledgeTableWaiterCall(tableId, session.restaurantId);
    return NextResponse.json({ table });
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
