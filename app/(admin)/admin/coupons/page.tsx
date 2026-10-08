"use client";

import { useState } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { CouponCard } from "@/components/admin/coupons/CouponCard";
import { CouponFormModal } from "@/components/admin/coupons/CouponFormModal";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loading } from "@/components/shared/Loading";
import { useCoupons } from "@/hooks/use-coupons";
import type { CouponView } from "@/types/coupon";

export default function CouponsPage() {
  const { coupons, isLoading, error, mutate } = useCoupons();
  const [editing, setEditing] = useState<CouponView | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  return (
    <AdminShell title="Coupons">
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-ink/50">
            {coupons.length} coupon{coupons.length === 1 ? "" : "s"}
          </p>
          <Button size="sm" onClick={() => setIsAdding(true)}>
            + New coupon
          </Button>
        </div>

        {isLoading && <Loading label="Loading coupons..." />}
        {error && <ErrorState message="Could not load coupons." onRetry={() => mutate()} />}

        {!isLoading && !error && coupons.length === 0 && (
          <p className="py-16 text-center text-sm text-ink/50">No coupons yet.</p>
        )}

        {!isLoading && !error && coupons.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {coupons.map((coupon) => (
              <CouponCard
                key={coupon._id}
                coupon={coupon}
                onEdit={() => setEditing(coupon)}
                onDeleted={() => mutate()}
              />
            ))}
          </div>
        )}
      </div>

      <CouponFormModal
        key={isAdding ? "add-open" : "add-closed"}
        open={isAdding}
        onClose={() => setIsAdding(false)}
        onSaved={() => mutate()}
      />
      <CouponFormModal
        key={editing ? `edit-${editing._id}` : "edit-closed"}
        open={!!editing}
        coupon={editing}
        onClose={() => setEditing(null)}
        onSaved={() => mutate()}
      />
    </AdminShell>
  );
}
