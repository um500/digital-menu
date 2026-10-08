"use client";

import { CreditCard, Gift, Receipt, Star, Store } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  LOYALTY_MAX_REDEEM_PERCENT,
  LOYALTY_POINT_VALUE_RUPEES,
  LOYALTY_RUPEES_PER_POINT_EARNED,
} from "@/lib/constants/loyalty";
import { formatCurrency } from "@/lib/utils";
import type { PaymentMethodToggles, SettingsView } from "@/types/settings";

const PAYMENT_METHOD_LABELS: Record<keyof PaymentMethodToggles, { label: string; description: string }> = {
  online: { label: "Online (Razorpay)", description: "UPI, cards, netbanking — collected before the order reaches the kitchen" },
  cash: { label: "Cash", description: "Collected at the table, admin approves before it reaches the kitchen" },
  card: { label: "Card (POS/EDC)", description: "Physical card machine brought to the table" },
  mealVoucher: { label: "Meal vouchers", description: "Sodexo and similar — enable only if this client accepts them" },
  corporateBilling: { label: "Corporate billing", description: "Bill-to-company accounts — enterprise clients only" },
};

const TABS = [
  { id: "info", label: "Restaurant Info", icon: Store },
  { id: "tax", label: "Tax & Billing", icon: Receipt },
  { id: "loyalty", label: "Loyalty Program", icon: Gift },
  { id: "payment", label: "Payment Settings", icon: CreditCard },
  { id: "review", label: "Google Review Link", icon: Star },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function SettingsForm({
  settings,
  onSaved,
}: {
  settings: SettingsView;
  onSaved: () => void;
}) {
  // Initialized straight from props — the parent renders this component only
  // once `settings` has loaded, and keys it by the settings doc's id, so a
  // resync effect isn't needed (see TableFormModal for the same pattern).
  const [activeTab, setActiveTab] = useState<TabId>("info");
  const [restaurantName, setRestaurantName] = useState(settings.restaurantName);
  const [gstNumber, setGstNumber] = useState(settings.gstNumber ?? "");
  const [gstPercent, setGstPercent] = useState(settings.gstPercent);
  const [paymentMethods, setPaymentMethods] = useState(settings.paymentMethods);
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(settings.loyaltyEnabled);
  const [googleReviewLink, setGoogleReviewLink] = useState(settings.googleReviewLink ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantName,
          gstNumber,
          gstPercent,
          paymentMethods,
          loyaltyEnabled,
          googleReviewLink,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save settings");
      setSuccess(true);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save settings");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr]">
      <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                isActive ? "bg-primary-light text-primary" : "text-ink/60 hover:bg-cream-soft hover:text-ink"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        {activeTab === "info" && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-ink">Restaurant Info</h2>
            <div className="space-y-1.5">
              <label htmlFor="restaurantName" className="text-sm font-medium text-ink/70">
                Restaurant name
              </label>
              <Input
                id="restaurantName"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                required
                maxLength={100}
              />
              <p className="text-xs text-ink/40">Shown on bills, KOTs and the customer menu header.</p>
            </div>
          </div>
        )}

        {activeTab === "tax" && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-ink">Tax & Billing</h2>
            <div className="space-y-1.5">
              <label htmlFor="gstNumber" className="text-sm font-medium text-ink/70">
                GST number (optional)
              </label>
              <Input
                id="gstNumber"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                placeholder="22AAAAA0000A1Z5"
                maxLength={20}
              />
              <p className="text-xs text-ink/40">Printed on every GST bill, when set.</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="gstPercent" className="text-sm font-medium text-ink/70">
                GST % (CGST + SGST combined)
              </label>
              <Input
                id="gstPercent"
                type="number"
                min={0}
                max={28}
                step={0.5}
                value={gstPercent}
                onChange={(e) => setGstPercent(Number(e.target.value))}
                required
              />
              <p className="text-xs text-ink/40">
                Applied as the default on new menu items; individual items can override it in Sanity Studio.
              </p>
            </div>
          </div>
        )}

        {activeTab === "loyalty" && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-ink">Loyalty Program</h2>
            <Switch
              checked={loyaltyEnabled}
              onChange={setLoyaltyEnabled}
              label="Enable loyalty points"
              description="Customers earn and redeem points at checkout. Turn off to hide it entirely."
            />
            <div className="rounded-xl bg-cream-soft px-3.5 py-3 text-sm text-ink/60">
              Customers earn 1 point for every {formatCurrency(LOYALTY_RUPEES_PER_POINT_EARNED)} spent.
              Each point is worth {formatCurrency(LOYALTY_POINT_VALUE_RUPEES)} off, redeemable up to{" "}
              {LOYALTY_MAX_REDEEM_PERCENT}% of a single bill.
              <p className="mt-1 text-xs text-ink/40">
                These rates apply to every restaurant on this platform right now — contact support to change them.
              </p>
            </div>
          </div>
        )}

        {activeTab === "payment" && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-ink">Payment Settings</h2>
            <p className="text-xs text-ink/40">
              Turn on only what this client accepts — customers only see enabled methods at checkout.
            </p>
            <div className="divide-y divide-border">
              {(Object.keys(PAYMENT_METHOD_LABELS) as (keyof PaymentMethodToggles)[]).map((key) => (
                <Switch
                  key={key}
                  checked={paymentMethods[key]}
                  onChange={(checked) => setPaymentMethods((prev) => ({ ...prev, [key]: checked }))}
                  label={PAYMENT_METHOD_LABELS[key].label}
                  description={PAYMENT_METHOD_LABELS[key].description}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === "review" && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-ink">Google Review Link</h2>
            <div className="space-y-1.5">
              <label htmlFor="googleReviewLink" className="text-sm font-medium text-ink/70">
                Review link
              </label>
              <Input
                id="googleReviewLink"
                type="url"
                value={googleReviewLink}
                onChange={(e) => setGoogleReviewLink(e.target.value)}
                placeholder="https://g.page/r/your-place/review"
              />
              <p className="text-xs text-ink/40">
                Shown to customers after they rate their order highly, so happy diners can leave a public review in
                one tap.
              </p>
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
          <Button type="submit" isLoading={isSaving}>
            Save settings
          </Button>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-accent-dark">Settings saved.</p>}
        </div>
      </div>
    </form>
  );
}
