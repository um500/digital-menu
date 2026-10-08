import type { OrderItemView } from "@/types/order";

export function KOTItem({ item }: { item: OrderItemView }) {
  return (
    <div className="flex justify-between py-0.5 text-sm">
      <span className="font-medium text-cream/90">
        {item.quantity} × {item.name}
      </span>
      {item.notes && <span className="text-xs italic text-cream/40">{item.notes}</span>}
    </div>
  );
}
