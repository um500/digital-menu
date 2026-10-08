import { NextResponse } from "next/server";

import { DEMO_RESTAURANT_ID } from "@/config/restaurant";
import { getOrCreateSettings } from "@/lib/settings/settings-admin";
import type { PublicSettingsView } from "@/types/settings";

/** Public — the customer checkout flow needs to know which payment methods are enabled. */
export async function GET() {
  const settings = await getOrCreateSettings(DEMO_RESTAURANT_ID);

  const view: PublicSettingsView = {
    restaurantName: settings.restaurantName,
    gstNumber: settings.gstNumber,
    paymentMethods: settings.paymentMethods,
    loyaltyEnabled: settings.loyaltyEnabled,
    googleReviewLink: settings.googleReviewLink,
  };

  return NextResponse.json(view);
}
