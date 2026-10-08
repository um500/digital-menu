import { Badge } from "@/components/ui/badge";
import type { TableStatus } from "@/types/table";

const TONE: Record<TableStatus, "neutral" | "success" | "warning"> = {
  empty: "success",
  occupied: "warning",
  reserved: "neutral",
};

export function TableStatusBadge({ status }: { status: TableStatus }) {
  return <Badge tone={TONE[status]}>{status}</Badge>;
}
