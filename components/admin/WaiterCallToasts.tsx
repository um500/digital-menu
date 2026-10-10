"use client";

import { Bell } from "lucide-react";

import { useWaiterCallToasts, type WaiterCallToast } from "@/hooks/use-waiter-call-toasts";

/**
 * Pinned top-right, just under the topbar — not bottom-right, where it's
 * easy for a busy staff member to miss entirely. Bold red + a pulsing ring
 * behind the bell icon so it actually catches the eye from across the
 * counter, not just a quiet corner toast. Stays on screen until
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
    <div className="fixed right-4 top-20 z-50 flex w-80 flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="relative flex items-start gap-3 rounded-2xl border-2 border-red-400 bg-red-50 p-4 shadow-2xl ring-4 ring-red-200"
        >
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white">
              <Bell className="h-5 w-5" strokeWidth={2.5} />
            </span>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold text-red-900">Waiter called!</p>
            <p className="text-sm font-medium text-red-700">
              {toast.orderNumber ? `#${toast.orderNumber} · ` : ""}
              {toast.tableLabel}
            </p>
            <button
              type="button"
              onClick={() => handleAcknowledge(toast)}
              className="mt-2.5 w-full rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
            >
              Acknowledge
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
