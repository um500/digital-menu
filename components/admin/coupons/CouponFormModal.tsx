"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";
import type { CouponType, CouponView } from "@/types/coupon";

interface CouponFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** Present when editing; absent when creating a new coupon. */
  coupon?: CouponView | null;
}

export function CouponFormModal({ open, onClose, onSaved, coupon }: CouponFormModalProps) {
  const [code, setCode] = useState(coupon?.code ?? "");
  const [type, setType] = useState<CouponType>(coupon?.type ?? "percent");
  const [value, setValue] = useState(coupon?.value ?? 10);
  const [minOrderAmount, setMinOrderAmount] = useState(coupon?.minOrderAmount ?? 0);
  const [maxDiscount, setMaxDiscount] = useState(coupon?.maxDiscount ?? undefined);
  const [expiresAt, setExpiresAt] = useState(coupon?.expiresAt ? coupon.expiresAt.slice(0, 10) : "");
  const [usageLimit, setUsageLimit] = useState(coupon?.usageLimit ?? undefined);
  const [isActive, setIsActive] = useState(coupon?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const url = coupon ? `/api/admin/coupons/${coupon._id}` : "/api/admin/coupons";
      const method = coupon ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          type,
          value,
          minOrderAmount,
          maxDiscount: type === "percent" ? maxDiscount : undefined,
          expiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59.000Z`).toISOString() : "",
          usageLimit,
          isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save coupon");
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save coupon");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-lg font-semibold text-ink">
          {coupon ? "Edit coupon" : "New coupon"}
        </h2>

        <div className="space-y-1.5">
          <label htmlFor="code" className="text-sm font-medium text-ink/70">
            Code
          </label>
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="WELCOME10"
            required
            maxLength={20}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="type" className="text-sm font-medium text-ink/70">
              Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as CouponType)}
              className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-light"
            >
              <option value="percent">% off</option>
              <option value="flat">₹ flat off</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="value" className="text-sm font-medium text-ink/70">
              {type === "percent" ? "Percent off" : "Amount off (₹)"}
            </label>
            <Input
              id="value"
              type="number"
              min={0}
              max={type === "percent" ? 100 : undefined}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              required
            />
          </div>
        </div>

        {type === "percent" && (
          <div className="space-y-1.5">
            <label htmlFor="maxDiscount" className="text-sm font-medium text-ink/70">
              Max discount cap (₹, optional)
            </label>
            <Input
              id="maxDiscount"
              type="number"
              min={0}
              value={maxDiscount ?? ""}
              onChange={(e) => setMaxDiscount(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="e.g. 100"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="minOrderAmount" className="text-sm font-medium text-ink/70">
              Min. order (₹)
            </label>
            <Input
              id="minOrderAmount"
              type="number"
              min={0}
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(Number(e.target.value))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="usageLimit" className="text-sm font-medium text-ink/70">
              Usage limit (optional)
            </label>
            <Input
              id="usageLimit"
              type="number"
              min={1}
              value={usageLimit ?? ""}
              onChange={(e) => setUsageLimit(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Unlimited"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="expiresAt" className="text-sm font-medium text-ink/70">
            Expires on (optional)
          </label>
          <Input
            id="expiresAt"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </div>

        <Switch checked={isActive} onChange={setIsActive} label="Active" description="Turn off to pause this coupon without deleting it" />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSaving}>
            {coupon ? "Save changes" : "Create coupon"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
