import "server-only";

import { connectDB } from "@/lib/db/connect";
import { Table, type ITable } from "@/lib/db/models/Table";
import { verifyTableSignature } from "@/lib/qr/generate-qr";

export class InvalidTableLinkError extends Error {
  constructor() {
    super("This table link looks invalid or has been tampered with.");
  }
}

/** Validates the signed QR params before trusting tableId/restaurantId from the URL at all. */
export async function getTableFromSignedLink(
  tableId: string,
  restaurantId: string,
  signature: string
): Promise<ITable> {
  if (!verifyTableSignature(tableId, restaurantId, signature)) {
    throw new InvalidTableLinkError();
  }

  await connectDB();
  const table = await Table.findOne({ _id: tableId, restaurantId });
  if (!table) throw new InvalidTableLinkError();

  return table;
}

export async function getTablesForRestaurant(restaurantId: string): Promise<ITable[]> {
  await connectDB();
  return Table.find({ restaurantId }).sort({ label: 1 });
}

/** Tables with an active waiter call — polled by the admin dashboard (see use-waiter-call-toasts.ts). */
export async function listActiveTableWaiterCalls(restaurantId: string): Promise<ITable[]> {
  await connectDB();
  return Table.find({ restaurantId, waiterCallAt: { $ne: null } });
}
