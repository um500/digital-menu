"use client";

import { Bell } from "lucide-react";
import { useState } from "react";

export function WaiterCallButton({
  orderId,
  waiterCallAt,
  onCalled,
}: {
  orderId: string;
  waiterCallAt?: string | null;
  onCalled: () => void;
}) {
  const [isCalling, setIsCalling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCall() {
    setIsCalling(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/call-waiter`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not call the waiter");
      onCalled();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not call the waiter");
    } finally {
      setIsCalling(false);
    }
  }

  if (waiterCallAt) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center text-sm text-amber-800">
        A waiter has been notified and is on the way.
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleCall}
        disabled={isCalling}
        aria-label="Call waiter"
        className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform active:scale-95 disabled:opacity-60"
      >
        <Bell className="h-6 w-6" strokeWidth={2} />
      </button>
      {error && <p className="text-center text-sm text-red-600">{error}</p>}
    </>
  );
}
