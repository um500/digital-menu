"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { CartSummary } from "@/components/customer/CartSummary";
import { CheckoutForm } from "@/components/customer/CheckoutForm";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";

export default function CheckoutPage() {
  const { lines, subtotal, tableId } = useCart();
  const router = useRouter();

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
      <h1 className="font-display mb-3 text-lg font-semibold text-ink">Checkout</h1>

      <div className="mb-4 rounded-xl border border-border bg-white p-4">
        <CartSummary subtotal={subtotal} />
      </div>

      <CheckoutForm
        tableId={tableId}
        estimatedAmount={subtotal}
        onOrderPlaced={(orderId) => router.push(`/order/${orderId}`)}
      />
    </div>
  );
}
