"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { KotPrintButton } from "@/components/kitchen/KotPrintButton";
import { KitchenStatusButton } from "@/components/kitchen/KitchenStatusButton";
import { BillPrintButton } from "@/components/shared/BillPrintButton";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { formatCurrency } from "@/lib/utils";
import type { OrderView } from "@/types/order";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrderDetailModalProps {
  order: OrderView | null;
  onClose: () => void;
}

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const { settings } = usePublicSettings();
  const [isCancelling, setIsCancelling] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  if (!order) return null;

  const canCancel = order.status === "placed" || order.status === "accepted";
  const canMarkPaid = order.paymentMethod !== "online" && order.paymentStatus !== "approved";
  const needsApproval = order.source === "qr" && canMarkPaid;
  const isCancelled = order.status === "cancelled";
  const placedAt = new Date(order.placedAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  async function handleMarkPaid() {
    setIsMarkingPaid(true);
    try {
      await fetch(`/api/admin/orders/${order!._id}/payment`, { method: "PATCH" });
    } finally {
      setIsMarkingPaid(false);
    }
  }

  async function handleCancel() {
    setIsCancelling(true);
    try {
      await fetch(`/api/orders/${order!._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      onClose();
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <Modal open={!!order} onClose={onClose}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-semibold text-ink">#{order.orderNumber}</h2>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-0.5 text-sm text-ink/50">
            {order.tableLabel ?? "Takeaway"} · {placedAt}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink/40 hover:bg-cream-soft hover:text-ink"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {isCancelled && (
        <div className="mt-4 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
          This order was cancelled.
          {order.paymentStatus === "approved" && (
            <>
              {" "}
              Payment of {formatCurrency(order.total)} was already collected — process a refund
              manually if applicable.
            </>
          )}
        </div>
      )}

      {needsApproval && !isCancelled && (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
          <span>Awaiting payment approval — not sent to kitchen yet</span>
          <Button size="sm" isLoading={isMarkingPaid} onClick={handleMarkPaid}>
            Approve
          </Button>
        </div>
      )}

      {order.waiterCallAt && !isCancelled && (
        <div className="mt-4 rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
          Waiter called for {order.tableLabel ?? "this table"}
        </div>
      )}

      <div className="mt-5 rounded-xl border border-border">
        {order.items.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 border-b border-border px-3 py-2.5 last:border-b-0"
          >
            <div className="min-w-0">
              <div className="text-sm font-medium text-ink">
                {item.quantity} × {item.name}
              </div>
              {item.notes && <div className="text-xs text-ink/40">{item.notes}</div>}
            </div>
            <span className="shrink-0 text-sm text-ink/70">
              {formatCurrency(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-1 text-sm">
        <div className="flex justify-between text-ink/60">
          <span>Subtotal</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        <div className="flex justify-between text-ink/60">
          <span>Tax</span>
          <span>{formatCurrency(order.taxTotal)}</span>
        </div>
        {order.discountTotal > 0 && (
          <div className="flex justify-between text-accent-dark">
            <span>Discount{order.couponCode && ` (${order.couponCode})`}</span>
            <span>-{formatCurrency(order.discountTotal)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-border pt-1.5 text-base font-semibold text-ink">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
        <div className="flex justify-between pt-1 text-xs text-ink/40">
          <span className="capitalize">{order.paymentMethod} payment</span>
          <span className="capitalize">{order.paymentStatus}</span>
        </div>
        {order.lastHandledByStaff && (
          <p className="pt-1 text-xs text-ink/40">Last handled by {order.lastHandledByStaff}</p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {!isCancelled && (
          <KitchenStatusButton orderId={order._id} status={order.status} className="w-auto" />
        )}
        <KotPrintButton order={order} />
        <BillPrintButton
          order={order}
          restaurantName={settings?.restaurantName ?? "Garden Cafe"}
          gstNumber={settings?.gstNumber}
        />
        {canCancel && !needsApproval && (
          <Button variant="danger" size="sm" isLoading={isCancelling} onClick={handleCancel}>
            Cancel order
          </Button>
        )}
      </div>
    </Modal>
  );
}
