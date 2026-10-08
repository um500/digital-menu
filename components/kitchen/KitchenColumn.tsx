import { KOTCard } from "./KOTCard";
import type { OrderView } from "@/types/order";

export type ColumnTone = "gray" | "orange" | "teal";

const DOT_CLASSES: Record<ColumnTone, string> = {
  gray: "bg-cream/40",
  orange: "bg-amber-400",
  teal: "bg-accent",
};

interface KitchenColumnProps {
  title: string;
  tone: ColumnTone;
  orders: OrderView[];
}

export function KitchenColumn({ title, tone, orders }: KitchenColumnProps) {
  return (
    <div className="flex min-w-[280px] flex-1 flex-col gap-2.5">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-cream/60">
        <span className={`h-2 w-2 rounded-full ${DOT_CLASSES[tone]}`} />
        {title} ({orders.length})
      </h2>
      <div className="flex flex-col gap-2.5">
        {orders.map((order) => (
          <KOTCard key={order._id} order={order} tone={tone} />
        ))}
        {orders.length === 0 && (
          <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-cream/30">
            Nothing here
          </p>
        )}
      </div>
    </div>
  );
}
