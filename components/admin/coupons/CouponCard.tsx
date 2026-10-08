"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { CouponView } from "@/types/coupon";

export function CouponCard({
  coupon,
  onEdit,
  onDeleted,
}: {
  coupon: CouponView;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isExhausted = coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit;

  async function handleDelete() {
    if (!window.confirm(`Delete coupon "${coupon.code}"?`)) return;
    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/coupons/${coupon._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not delete coupon");
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete coupon");
      setIsDeleting(false);
    }
  }

  return (
    <Card>
      <CardBody className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono font-semibold text-ink">{coupon.code}</span>
          {!coupon.isActive ? (
            <Badge tone="neutral">Paused</Badge>
          ) : coupon.isExpired ? (
            <Badge tone="danger">Expired</Badge>
          ) : isExhausted ? (
            <Badge tone="warning">Limit reached</Badge>
          ) : (
            <Badge tone="success">Active</Badge>
          )}
        </div>

        <p className="text-sm text-ink/60">
          {coupon.type === "percent" ? `${coupon.value}% off` : `${formatCurrency(coupon.value)} off`}
          {coupon.minOrderAmount > 0 && ` · min ${formatCurrency(coupon.minOrderAmount)}`}
        </p>
        <p className="text-xs text-ink/50">
          Used {coupon.usedCount}
          {coupon.usageLimit != null ? ` / ${coupon.usageLimit}` : ""}
          {coupon.expiresAt && ` · expires ${new Date(coupon.expiresAt).toLocaleDateString("en-IN")}`}
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2 pt-1">
          <Button variant="secondary" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="danger" size="sm" isLoading={isDeleting} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
