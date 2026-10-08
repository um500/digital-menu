export interface PaymentMethodToggles {
  online: boolean;
  cash: boolean;
  card: boolean;
  mealVoucher: boolean;
  corporateBilling: boolean;
}

export interface SettingsView {
  _id: string;
  restaurantId: string;
  restaurantName: string;
  gstNumber?: string;
  gstPercent: number;
  paymentMethods: PaymentMethodToggles;
  loyaltyEnabled: boolean;
  googleReviewLink?: string;
}

/** What the customer-facing checkout is allowed to know — no admin internals. */
export interface PublicSettingsView {
  restaurantName: string;
  gstNumber?: string;
  paymentMethods: PaymentMethodToggles;
  loyaltyEnabled: boolean;
  googleReviewLink?: string;
}
