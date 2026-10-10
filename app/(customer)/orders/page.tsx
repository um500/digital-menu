"use client";

import Link from "next/link";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loading } from "@/components/shared/Loading";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import type { OrderView } from "@/types/order";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const STATUS_LABEL: Record<string, string> = {
  placed: "Placed",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready",
  served: "Served",
  cancelled: "Cancelled",
};

export default function OrderHistoryPage() {
  const { customerPhone, addItem, clear } = useCart();
  const { data, isLoading, error } = useSWR<{ orders: OrderView[] }>(
    customerPhone ? `/api/customers/${customerPhone}/orders` : null,
    fetcher
  );

  if (!customerPhone) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="text-sm text-ink/50">Scan a table&apos;s QR code to see your order history.</p>
        <Link href="/menu">
          <Button variant="secondary">Back to menu</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) return <Loading label="Loading your orders..." />;
  if (error) return <ErrorState message="Could not load your order history." />;

  const orders = data?.orders ?? [];

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="text-sm text-ink/50">No past orders yet on this number.</p>
        <Link href="/menu">
          <Button variant="secondary">Back to menu</Button>
        </Link>
      </div>
    );
  }

  function handleReorder(order: OrderView) {
    clear();
    for (const item of order.items) {
      addItem(
        { menuItemId: item.menuItemId, name: item.name, price: item.price, notes: item.notes },
        item.quantity
      );
    }
  }

  return (
    <div className="px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="font-display text-lg font-semibold text-ink">Your orders</h1>
        <Link href="/menu" className="text-sm font-medium text-primary">
          Back to menu
        </Link>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order._id} className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-ink">#{order.orderNumber}</p>
                <p className="text-xs text-ink/40">
                  {new Date(order.placedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <span className="rounded-full bg-cream-soft px-2.5 py-1 text-xs font-medium text-ink/60">
                {STATUS_LABEL[order.status] ?? order.status}
              </span>
            </div>

            <ul className="mt-2 space-y-0.5 text-sm text-ink/70">
              {order.items.map((item, i) => (
                <li key={i}>
                  {item.quantity} × {item.name}
                </li>
              ))}
            </ul>

            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm font-semibold text-ink">{formatCurrency(order.total)}</span>
              <div className="flex items-center gap-3">
                <Link href={`/order/${order._id}`} className="text-xs font-medium text-ink/50 underline">
                  View
                </Link>
                <Button size="sm" onClick={() => handleReorder(order)}>
                  Reorder
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
