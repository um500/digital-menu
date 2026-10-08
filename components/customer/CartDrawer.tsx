"use client";

import Link from "next/link";

import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";

/** Sticky bottom bar shown on the menu page once the cart has items — tap to go to /cart. */
export function CartDrawer() {
  const { itemCount, subtotal } = useCart();

  if (itemCount === 0) return null;

  return (
    <Link
      href="/cart"
      className="fixed inset-x-4 bottom-4 z-30 flex items-center justify-between rounded-xl bg-primary px-4 py-3 text-white shadow-lg"
    >
      <span className="text-sm font-medium">
        {itemCount} item{itemCount > 1 ? "s" : ""} · {formatCurrency(subtotal)}
      </span>
      <span className="text-sm font-semibold">View cart →</span>
    </Link>
  );
}
