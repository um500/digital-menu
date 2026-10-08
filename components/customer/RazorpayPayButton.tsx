"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  prefill?: { name?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

// Razorpay's checkout.js attaches this global; there's no official npm
// type package for the client widget (only for the server SDK, which we
// use separately in lib/payments/razorpay.ts).
declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}

const CHECKOUT_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = CHECKOUT_SCRIPT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface RazorpayPayButtonProps {
  orderId: string;
  orderNumber: string;
  restaurantName: string;
  customerName?: string;
  customerPhone?: string;
  onPaid: () => void;
}

export function RazorpayPayButton({
  orderId,
  orderNumber,
  restaurantName,
  customerName,
  customerPhone,
  onPaid,
}: RazorpayPayButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setIsLoading(true);
    setError(null);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Could not load the payment form. Check your connection and try again.");
      }

      const createRes = await fetch(`/api/payments/razorpay/${orderId}/create-order`, {
        method: "POST",
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error ?? "Could not start payment");

      const razorpay = new window.Razorpay({
        key: createData.keyId,
        amount: createData.amount,
        currency: createData.currency,
        name: restaurantName,
        description: `Order #${orderNumber}`,
        order_id: createData.razorpayOrderId,
        prefill: { name: customerName, contact: customerPhone },
        theme: { color: "#bc4a28" },
        modal: {
          ondismiss: () => setIsLoading(false),
        },
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`/api/payments/razorpay/${orderId}/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error ?? "Payment could not be verified");
            onPaid();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Payment could not be verified");
          } finally {
            setIsLoading(false);
          }
        },
      });

      razorpay.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start payment");
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="button" className="w-full" size="lg" isLoading={isLoading} onClick={handlePay}>
        Pay now
      </Button>
    </div>
  );
}
