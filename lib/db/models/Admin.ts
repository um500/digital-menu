import mongoose, { Schema, type Document, type Model } from "mongoose";

/**
 * Phase 1 only needs a single admin login per restaurant to view Live
 * Orders. Full staff roles/PINs (Staff.ts) come in a later phase.
 */
export interface IAdmin extends Document {
  restaurantId: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    restaurantId: { type: String, required: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

export const Admin: Model<IAdmin> =
  mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);

export default Admin;
