import { KitchenStatusButton } from "./KitchenStatusButton";
import { KitchenTimer } from "./KitchenTimer";
import { KotPrintButton } from "./KotPrintButton";
import { KOTItem } from "./KOTItem";
import type { ColumnTone } from "./KitchenColumn";
import type { OrderView } from "@/types/order";

const BORDER_CLASSES: Record<ColumnTone, string> = {
  gray: "border-white/15",
  orange: "border-amber-500/50",
  teal: "border-accent/50",
};

export function KOTCard({ order, tone }: { order: OrderView; tone: ColumnTone }) {
  return (
    <div className={`flex flex-col gap-2 rounded-xl border bg-ink-soft p-3 shadow-sm ${BORDER_CLASSES[tone]}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-cream">
          #{order.orderNumber} · {order.tableLabel ?? "Takeaway"}
        </span>
        <KitchenTimer placedAt={order.placedAt} />
      </div>

      <div className="divide-y divide-white/10">
        {order.items.map((item, i) => (
          <KOTItem key={i} item={item} />
        ))}
      </div>

      {order.notes && <p className="text-xs italic text-cream/50">Note: {order.notes}</p>}

      <div className="flex gap-2">
        <div className="flex-1">
          <KitchenStatusButton orderId={order._id} status={order.status} />
        </div>
        <KotPrintButton order={order} />
      </div>
    </div>
  );
}
