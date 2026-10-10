"use client";

import { Bell } from "lucide-react";

import { useWaiterCallToasts, type WaiterCallToast } from "@/hooks/use-waiter-call-toasts";

/**
 * Pinned top-right, just under the topbar — not bottom-right, where it's
 * easy for a busy staff member to miss entirely. Stays on screen until
 * "Acknowledge" is tapped (see use-waiter-call-toasts.ts): there's no
 * separate silent-dismiss control, on purpose — a call a table is waiting
 * on shouldn't be closeable without actually handling it.
 */
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
    <div className="fixed right-4 top-20 z-50 flex w-72 flex-col gap-2">
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
              className="mt-2 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
            >
              Acknowledge
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
