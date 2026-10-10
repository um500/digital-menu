"use client";

import { Bell, X } from "lucide-react";

import { useWaiterCallToasts, type WaiterCallToast } from "@/hooks/use-waiter-call-toasts";

export function WaiterCallToasts() {
  const { toasts, dismiss } = useWaiterCallToasts();

  async function handleAcknowledge(toast: WaiterCallToast) {
    dismiss(toast.id);
    const url = toast.orderId
      ? `/api/orders/${toast.orderId}/call-waiter`
      : `/api/tables/${toast.tableId}/call-waiter`;
    await fetch(url, { method: "DELETE" });
  }

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-72 flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 shadow-lg"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400 text-white">
            <Bell className="h-4 w-4" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-amber-900">Waiter called</p>
            <p className="text-xs text-amber-700">
              {toast.orderNumber ? `#${toast.orderNumber} · ` : ""}
              {toast.tableLabel}
            </p>
            <button
              type="button"
              onClick={() => handleAcknowledge(toast)}
              className="mt-1 text-xs font-medium text-amber-800 underline hover:text-amber-900"
            >
              Acknowledge
            </button>
          </div>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss"
            className="shrink-0 text-amber-500 hover:text-amber-700"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      ))}
    </div>
  );
}
