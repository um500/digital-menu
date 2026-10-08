import "server-only";

import { connectDB } from "@/lib/db/connect";
import { Settings, type ISettings } from "@/lib/db/models/Settings";
import type { UpdateSettingsInput } from "@/lib/validations/settings";

/**
 * Settings is a singleton per restaurant. We upsert rather than require a
 * seed step, so a freshly onboarded client always has sane defaults instead
 * of the admin settings page breaking on a missing document.
 */
export async function getOrCreateSettings(restaurantId: string): Promise<ISettings> {
  await connectDB();

  const settings = await Settings.findOneAndUpdate(
    { restaurantId },
    {
      $setOnInsert: {
        restaurantId,
        restaurantName: "My Restaurant",
        gstPercent: 5,
        paymentMethods: { online: true, cash: true, card: true, mealVoucher: false, corporateBilling: false },
        loyaltyEnabled: true,
      },
    },
    { new: true, upsert: true }
  );

  return settings;
}

export async function updateSettings(
  restaurantId: string,
  input: UpdateSettingsInput
): Promise<ISettings> {
  await connectDB();

  const settings = await Settings.findOneAndUpdate(
    { restaurantId },
    {
      $set: {
        restaurantName: input.restaurantName,
        gstNumber: input.gstNumber || undefined,
        gstPercent: input.gstPercent,
        paymentMethods: input.paymentMethods,
        loyaltyEnabled: input.loyaltyEnabled,
        googleReviewLink: input.googleReviewLink || undefined,
      },
    },
    { new: true, upsert: true }
  );

  return settings;
}
