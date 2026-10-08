import mongoose, { Schema, type Document, type Model } from "mongoose";

/**
 * One Settings document per restaurant. Payment methods are toggle-based
 * (see project notes): online/cash/card ship ON by default, enterprise-only
 * methods stay OFF until a client actually asks for them.
 */
export interface ISettings extends Document {
  restaurantId: string;
  restaurantName: string;
  gstNumber?: string;
  gstPercent: number;
  paymentMethods: {
    online: boolean;
    cash: boolean;
    card: boolean;
    mealVoucher: boolean;
    corporateBilling: boolean;
  };
  /** Turns the whole points-earn/redeem flow off for this restaurant — checkout hides it, create-order skips it. */
  loyaltyEnabled: boolean;
  /** Shown to customers on Google review prompts after they leave feedback (see FeedbackForm). */
  googleReviewLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    restaurantId: { type: String, required: true, unique: true },
    restaurantName: { type: String, required: true },
    gstNumber: { type: String },
    gstPercent: { type: Number, required: true, default: 5 },
    paymentMethods: {
      online: { type: Boolean, default: true },
      cash: { type: Boolean, default: true },
      card: { type: Boolean, default: true },
      mealVoucher: { type: Boolean, default: false },
      corporateBilling: { type: Boolean, default: false },
    },
    loyaltyEnabled: { type: Boolean, default: true },
    googleReviewLink: { type: String },
  },
  { timestamps: true }
);

export const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;
