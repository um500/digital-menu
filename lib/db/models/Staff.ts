import mongoose, { Schema, type Document, type Model } from "mongoose";

export type StaffRole = "waiter" | "kitchen" | "cashier";

/**
 * Lightweight staff identity for SHARED devices (kitchen tablet, counter
 * terminal) — not a replacement for admin login. The admin signs into the
 * device once; individual staff then "clock in" with their PIN before an
 * action so it can be attributed to them, without needing one device per
 * person (decided earlier: waiters/kitchen staff don't have individual
 * devices).
 */
export interface IStaff extends Document {
  restaurantId: string;
  name: string;
  pinHash: string; // bcrypt, same as Admin.passwordHash — never store the raw PIN
  role: StaffRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StaffSchema = new Schema<IStaff>(
  {
    restaurantId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    pinHash: { type: String, required: true },
    role: { type: String, enum: ["waiter", "kitchen", "cashier"], required: true },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

export const Staff: Model<IStaff> =
  mongoose.models.Staff || mongoose.model<IStaff>("Staff", StaffSchema);

export default Staff;
