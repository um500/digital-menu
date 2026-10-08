import type { OrderStatus } from "@/lib/db/models/Order";

export const ORDER_STATUSES: OrderStatus[] = [
  "placed",
  "accepted",
  "preparing",
  "ready",
  "served",
  "cancelled",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Placed",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready",
  served: "Served",
  cancelled: "Cancelled",
};

// What the kitchen board is allowed to move an order to, from its current
// status. Keeps a tablet-tap from skipping steps or reviving a cancelled order.
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  placed: ["accepted", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["served"],
  served: [],
  cancelled: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}
