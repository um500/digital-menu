import "server-only";

import { connectDB } from "@/lib/db/connect";
import { Table, type ITable } from "@/lib/db/models/Table";
import { signTable } from "@/lib/qr/generate-qr";
import type { CreateTableInput, UpdateTableInput } from "@/lib/validations/table";

export class DuplicateTableError extends Error {
  constructor(label: string) {
    super(`A table named "${label}" already exists.`);
  }
}

export class TableNotFoundError extends Error {
  constructor() {
    super("Table not found.");
  }
}

export class TableInUseError extends Error {
  constructor() {
    super("This table has an active order — cancel or serve it first.");
  }
}

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code: unknown }).code === 11000;
}

/**
 * The table's QR signature is derived from its own Mongo _id, so we create
 * the document first (to get an _id) and then set+save the signature —
 * there's no way to sign a table ID that doesn't exist yet.
 */
export async function createTable(restaurantId: string, input: CreateTableInput): Promise<ITable> {
  await connectDB();

  const table = new Table({
    restaurantId,
    label: input.label,
    capacity: input.capacity,
    qrSignature: "placeholder", // overwritten below before save
  });
  table.qrSignature = signTable(table._id.toString(), restaurantId);

  try {
    await table.save();
  } catch (err) {
    if (isDuplicateKeyError(err)) throw new DuplicateTableError(input.label);
    throw err;
  }

  return table;
}

export async function listTables(restaurantId: string): Promise<ITable[]> {
  await connectDB();
  return Table.find({ restaurantId }).sort({ label: 1 });
}

export async function getTableForAdmin(restaurantId: string, tableId: string): Promise<ITable> {
  await connectDB();
  const table = await Table.findOne({ _id: tableId, restaurantId });
  if (!table) throw new TableNotFoundError();
  return table;
}

export async function updateTable(
  restaurantId: string,
  tableId: string,
  input: UpdateTableInput
): Promise<ITable> {
  await connectDB();

  try {
    const table = await Table.findOneAndUpdate(
      { _id: tableId, restaurantId },
      { $set: input },
      { new: true }
    );
    if (!table) throw new TableNotFoundError();
    return table;
  } catch (err) {
    if (isDuplicateKeyError(err)) throw new DuplicateTableError(input.label ?? tableId);
    throw err;
  }
}

export async function deleteTable(restaurantId: string, tableId: string): Promise<void> {
  await connectDB();

  const table = await Table.findOne({ _id: tableId, restaurantId });
  if (!table) throw new TableNotFoundError();
  if (table.activeOrderId) throw new TableInUseError();

  await Table.deleteOne({ _id: tableId, restaurantId });
}
