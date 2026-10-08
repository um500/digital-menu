"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CartItem } from "@/components/customer/CartItem";
import { CartSummary } from "@/components/customer/CartSummary";
import { useCart } from "@/hooks/use-cart";

export default function CartPage() {
  const { lines, subtotal, updateQuantity, removeItem } = useCart();

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="text-sm text-ink/50">Your cart is empty.</p>
        <Link href="/menu">
          <Button variant="secondary">Back to menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <h1 className="font-display mb-3 text-lg font-semibold text-ink">Your order</h1>

      <div className="rounded-xl border border-border bg-white px-4">
        {lines.map((line) => (
          <CartItem
            key={line.menuItemId}
            line={line}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-border bg-white p-4">
        <CartSummary subtotal={subtotal} />
      </div>

      <div className="mt-4 flex gap-3">
        <Link href="/menu" className="flex-1">
          <Button variant="secondary" className="w-full">
            Add more items
          </Button>
        </Link>
        <Link href="/checkout" className="flex-1">
          <Button className="w-full">Checkout</Button>
        </Link>
      </div>
    </div>
  );
}
