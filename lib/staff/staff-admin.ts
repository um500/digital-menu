import "server-only";

import { connectDB } from "@/lib/db/connect";
import { hashPassword } from "@/lib/auth/password";
import { Staff, type IStaff } from "@/lib/db/models/Staff";
import type { CreateStaffInput, UpdateStaffInput } from "@/lib/validations/staff";

export class StaffNotFoundError extends Error {
  constructor() {
    super("Staff member not found.");
  }
}

export async function listStaff(restaurantId: string): Promise<IStaff[]> {
  await connectDB();
  return Staff.find({ restaurantId }).sort({ name: 1 });
}

export async function createStaff(restaurantId: string, input: CreateStaffInput): Promise<IStaff> {
  await connectDB();
  const pinHash = await hashPassword(input.pin);
  return Staff.create({ restaurantId, name: input.name, pinHash, role: input.role, isActive: true });
}

export async function updateStaff(
  restaurantId: string,
  staffId: string,
  input: UpdateStaffInput
): Promise<IStaff> {
  await connectDB();

  const update: Record<string, unknown> = {
    ...(input.name !== undefined && { name: input.name }),
    ...(input.role !== undefined && { role: input.role }),
    ...(input.isActive !== undefined && { isActive: input.isActive }),
  };
  if (input.pin) {
    update.pinHash = await hashPassword(input.pin);
  }

  const staff = await Staff.findOneAndUpdate({ _id: staffId, restaurantId }, { $set: update }, { new: true });
  if (!staff) throw new StaffNotFoundError();
  return staff;
}

export async function deleteStaff(restaurantId: string, staffId: string): Promise<void> {
  await connectDB();
  const result = await Staff.deleteOne({ _id: staffId, restaurantId });
  if (result.deletedCount === 0) throw new StaffNotFoundError();
}
