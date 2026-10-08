import { KitchenColumn } from "./KitchenColumn";
import type { OrderView } from "@/types/order";

export function KitchenBoard({ orders }: { orders: OrderView[] }) {
  const placed = orders.filter((o) => o.status === "placed" || o.status === "accepted");
  const preparing = orders.filter((o) => o.status === "preparing");
  const ready = orders.filter((o) => o.status === "ready");

  return (
    <div className="flex gap-4 overflow-x-auto p-4">
      <KitchenColumn title="Placed" tone="gray" orders={placed} />
      <KitchenColumn title="Preparing" tone="orange" orders={preparing} />
      <KitchenColumn title="Ready" tone="teal" orders={ready} />
    </div>
  );
}
