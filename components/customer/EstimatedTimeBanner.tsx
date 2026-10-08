import { Clock } from "lucide-react";

import type { OrderStatus } from "@/types/order";

const COPY: Partial<Record<OrderStatus, string>> = {
  placed: "Usually accepted within a few minutes",
  accepted: "Usually ready in 15–20 min",
  preparing: "Usually ready in 10–15 min",
  ready: "Ready now — on its way to your table",
};

/** A rough, generic expectation-setter — not a live kitchen estimate. */
export function EstimatedTimeBanner({ status }: { status: OrderStatus }) {
  const copy = COPY[status];
  if (!copy) return null;

  return (
    <div className="flex items-center gap-2 rounded-xl bg-primary-light px-3 py-2 text-sm text-primary">
      <Clock className="h-4 w-4 shrink-0" strokeWidth={2} />
      {copy}
    </div>
  );
}
