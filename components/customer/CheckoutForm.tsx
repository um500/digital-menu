"use client";

import { useState, type FormEvent } from "react";

import { Input } from "@/components/ui/input";
import { usePublicSettings } from "@/hooks/use-public-settings";
import type { PaymentMethod } from "@/types/order";
import { CouponInput } from "./CouponInput";
import { LoyaltyPanel } from "./LoyaltyPanel";
import { PaymentMethodSelect } from "./PaymentMethodSelect";
import { PlaceOrderButton } from "./PlaceOrderButton";

interface CheckoutFormProps {
  tableId: string | null;
  estimatedAmount: number;
  onOrderPlaced: (orderId: string) => void;
}

export function CheckoutForm({ tableId, estimatedAmount, onOrderPlaced }: CheckoutFormProps) {
  const { settings } = usePublicSettings();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");

  return (
    <form
      className="space-y-4"
      onSubmit={(e: FormEvent) => e.preventDefault()}
    >
      <div className="space-y-1.5">
        <label htmlFor="customerName" className="text-sm font-medium text-ink/70">
          Name (optional)
        </label>
        <Input
          id="customerName"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="For the waiter to call out your order"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="customerPhone" className="text-sm font-medium text-ink/70">
          Phone (optional)
        </label>
        <Input
          id="customerPhone"
          inputMode="numeric"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder="10-digit number, for order updates & loyalty points"
        />
      </div>

      {settings?.loyaltyEnabled !== false && (
        <LoyaltyPanel
          phone={customerPhone}
          estimatedAmount={estimatedAmount}
          redeemPoints={redeemPoints}
          onRedeemPointsChange={setRedeemPoints}
        />
      )}

      <CouponInput
        estimatedAmount={estimatedAmount}
        appliedCode={couponCode}
        onApplied={(code) => setCouponCode(code)}
        onRemoved={() => setCouponCode(null)}
      />

      <PaymentMethodSelect
        value={paymentMethod}
        onChange={setPaymentMethod}
        enabledMethods={settings?.paymentMethods}
      />

      <PlaceOrderButton
        tableId={tableId}
        customerName={customerName || undefined}
        customerPhone={customerPhone.length === 10 ? customerPhone : undefined}
        couponCode={couponCode ?? undefined}
        redeemPoints={redeemPoints}
        paymentMethod={paymentMethod}
        onOrderPlaced={onOrderPlaced}
      />
    </form>
  );
}
