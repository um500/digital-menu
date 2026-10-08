"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

interface CouponInputProps {
  estimatedAmount: number;
  appliedCode: string | null;
  onApplied: (code: string, discount: number) => void;
  onRemoved: () => void;
}

export function CouponInput({ estimatedAmount, appliedCode, onApplied, onRemoved }: CouponInputProps) {
  const [code, setCode] = useState("");
  const [discountPreview, setDiscountPreview] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  async function handleApply() {
    if (!code.trim()) return;
    setIsChecking(true);
    setError(null);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), estimatedAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invalid coupon");
      setDiscountPreview(data.discount);
      onApplied(code.trim().toUpperCase(), data.discount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid coupon");
    } finally {
      setIsChecking(false);
    }
  }

  function handleRemove() {
    setCode("");
    setDiscountPreview(null);
    setError(null);
    onRemoved();
  }

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-accent/30 bg-accent-light px-3 py-2">
        <span className="text-sm text-accent-dark">
          <strong>{appliedCode}</strong> applied
          {discountPreview != null && ` — ${formatCurrency(discountPreview)} off`}
        </span>
        <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
          Remove
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Coupon code"
          maxLength={20}
        />
        <Button type="button" variant="secondary" isLoading={isChecking} onClick={handleApply}>
          Apply
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
