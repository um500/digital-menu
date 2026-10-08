import { Badge } from "@/components/ui/badge";
import type { OrderStatus as OrderStatusType } from "@/types/order";

const TONE: Record<OrderStatusType, "neutral" | "info" | "success" | "warning" | "danger"> = {
  placed: "info",
  accepted: "info",
  preparing: "warning",
  ready: "success",
  served: "neutral",
  cancelled: "danger",
};

const LABEL: Record<OrderStatusType, string> = {
  placed: "Order placed",
  accepted: "Accepted by kitchen",
  preparing: "Being prepared",
  ready: "Ready to serve",
  served: "Served",
  cancelled: "Cancelled",
};

export function OrderStatus({ status }: { status: OrderStatusType }) {
  return <Badge tone={TONE[status]}>{LABEL[status]}</Badge>;
}
