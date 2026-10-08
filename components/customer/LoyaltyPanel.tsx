"use client";

import { useEffect, useState } from "react";

import { Switch } from "@/components/ui/switch";
import { LOYALTY_MAX_REDEEM_PERCENT, LOYALTY_POINT_VALUE_RUPEES, rupeesForPoints } from "@/lib/constants/loyalty";
import { formatCurrency } from "@/lib/utils";

interface LoyaltyPanelProps {
  phone: string; // already validated to be 10 digits by the caller, or empty
  estimatedAmount: number;
  redeemPoints: number;
  onRedeemPointsChange: (points: number) => void;
}

/** Looks up the customer's points by phone (debounced) and offers to redeem the maximum allowed. */
export function LoyaltyPanel({ phone, estimatedAmount, redeemPoints, onRedeemPointsChange }: LoyaltyPanelProps) {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (phone.length !== 10) {
      onRedeemPointsChange(0);
      return;
    }

    // The balance reset lives inside the timer callback (not synchronously in
    // the effect body) so switching phone numbers doesn't trip the
    // set-state-in-effect rule — it still clears any stale balance from a
    // previous number before the new lookup resolves.
    const timer = setTimeout(() => {
      setBalance(null);
      fetch(`/api/customers/lookup?phone=${phone}`)
        .then((res) => res.json())
        .then((data) => setBalance(data.customer?.loyaltyPoints ?? 0))
        .catch(() => setBalance(null));
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onRedeemPointsChange is a stable setter from the parent
  }, [phone]);

  if (phone.length !== 10) return null;
  if (!balance || balance <= 0) return null;

  const maxRupees = Math.floor((estimatedAmount * LOYALTY_MAX_REDEEM_PERCENT) / 100);
  const maxPoints = Math.min(balance, Math.floor(maxRupees / LOYALTY_POINT_VALUE_RUPEES));
  if (maxPoints <= 0) return null;

  return (
    <div className="rounded-lg border border-primary/20 bg-primary-light p-3">
      <Switch
        checked={redeemPoints > 0}
        onChange={(checked) => onRedeemPointsChange(checked ? maxPoints : 0)}
        label={`You have ${balance} points`}
        description={`Redeem ${maxPoints} points for ${formatCurrency(rupeesForPoints(maxPoints))} off`}
      />
    </div>
  );
}
