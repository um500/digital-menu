"use client";

import { Bell, Clock } from "lucide-react";

import { formatCurrency, cn } from "@/lib/utils";
import type { OrderView } from "@/types/order";

function minutesAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.round(diffMs / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.round(mins / 60)}h ago`;
}

export function LiveOrderCard({ order, onOpen }: { order: OrderView; onOpen: () => void }) {
  const canMarkPaid = order.paymentMethod !== "online" && order.paymentStatus !== "approved";
  const needsApproval = order.source === "qr" && canMarkPaid;
  const flagged = needsApproval || !!order.waiterCallAt;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "w-full rounded-xl border bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md",
        flagged ? "border-amber-300 ring-1 ring-amber-200" : "border-border"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-ink">
          #{order.orderNumber} · {order.tableLabel ?? "Takeaway"}
        </span>
        {order.waiterCallAt && <Bell className="h-3.5 w-3.5 shrink-0 text-amber-600" strokeWidth={2} />}
      </div>

      {needsApproval && (
        <div className="mt-1.5 rounded-md bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
          Awaiting payment approval
        </div>
      )}

      <ul className="mt-2 space-y-0.5 text-xs text-ink/50">
        {order.items.slice(0, 3).map((item, i) => (
          <li key={i} className="truncate">
            {item.quantity} × {item.name}
          </li>
        ))}
        {order.items.length > 3 && <li>+{order.items.length - 3} more</li>}
      </ul>

      <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2 text-xs">
        <span className="flex items-center gap-1 text-ink/40">
          <Clock className="h-3 w-3" strokeWidth={2} />
          {minutesAgo(order.placedAt)}
        </span>
        <span className="font-semibold text-ink">{formatCurrency(order.total)}</span>
      </div>
    </button>
  );
}
