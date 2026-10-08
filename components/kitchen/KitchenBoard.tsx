import { KitchenColumn } from "./KitchenColumn";
import type { OrderView } from "@/types/order";

export function KitchenBoard({ orders }: { orders: OrderView[] }) {
  const placed = orders.filter((o) => o.status === "placed" || o.status === "accepted");
  const preparing = orders.filter((o) => o.status === "preparing");
  const ready = orders.filter((o) => o.status === "ready");

  return (
    // Below `sm` (a kitchen tablet propped up next to the pass) this stacks
    // into one scrollable column instead of three side by side — three
    // 280px-min columns don't fit a 360px phone, which used to leave the
    // page mostly black with the other two columns scrolled off-screen.
    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:overflow-x-auto">
      <KitchenColumn title="Placed" tone="gray" orders={placed} />
      <KitchenColumn title="Preparing" tone="orange" orders={preparing} />
      <KitchenColumn title="Ready" tone="teal" orders={ready} />
    </div>
  );
}
