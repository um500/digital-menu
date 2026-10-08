import mongoose, { Schema, type Document, type Model } from "mongoose";

/**
 * One record per (restaurantId, phone). No OTP verification — a customer is
 * identified by whatever phone number they type at checkout (decided
 * earlier). loyaltyPoints is the single source of truth for balance; it's
 * only ever changed via an atomic $inc in lib/loyalty/customer-loyalty.ts,
 * never read-then-written from application code.
 */
export interface ICustomer extends Document {
  restaurantId: string;
  phone: string;
  name?: string;
  loyaltyPoints: number;
  totalOrders: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    restaurantId: { type: String, required: true, index: true },
    phone: { type: String, required: true },
    name: { type: String },
    loyaltyPoints: { type: Number, required: true, default: 0, min: 0 },
    totalOrders: { type: Number, required: true, default: 0 },
    totalSpent: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

CustomerSchema.index({ restaurantId: 1, phone: 1 }, { unique: true });

export const Customer: Model<ICustomer> =
  mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema);

export default Customer;
