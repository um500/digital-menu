import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types/order";

const TONE: Record<OrderStatus, "neutral" | "info" | "success" | "warning" | "danger"> = {
  placed: "info",
  accepted: "info",
  preparing: "warning",
  ready: "success",
  served: "neutral",
  cancelled: "danger",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={TONE[status]}>{status}</Badge>;
}
