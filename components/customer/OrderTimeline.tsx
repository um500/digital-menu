import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: "placed", label: "Placed" },
  { status: "accepted", label: "Accepted" },
  { status: "preparing", label: "Preparing" },
  { status: "ready", label: "Ready" },
  { status: "served", label: "Served" },
];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return <p className="text-sm text-red-600">This order was cancelled.</p>;
  }

  const activeIndex = STEPS.findIndex((s) => s.status === status);

  return (
    <div className="flex items-center justify-between">
      {STEPS.map((step, i) => (
        <div key={step.status} className="flex flex-1 items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn("h-3 w-3 rounded-full", i <= activeIndex ? "bg-primary" : "bg-cream-soft")}
            />
            <span className={cn("text-[11px]", i <= activeIndex ? "font-medium text-ink" : "text-ink/30")}>
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn("mx-1 h-0.5 flex-1", i < activeIndex ? "bg-primary" : "bg-cream-soft")} />
          )}
        </div>
      ))}
    </div>
  );
}
