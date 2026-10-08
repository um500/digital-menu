"use client";

import { Banknote, CreditCard, Smartphone } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types/order";
import type { PaymentMethodToggles } from "@/types/settings";

interface PaymentMethodSelectProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  enabledMethods?: PaymentMethodToggles;
}

const OPTIONS: {
  value: Exclude<PaymentMethod, "manual">;
  label: string;
  description: string;
  icon: typeof Smartphone;
}[] = [
  { value: "online", label: "Pay online now", description: "UPI, cards & more via Razorpay", icon: Smartphone },
  { value: "cash", label: "Pay at the table", description: "Cash, settled when the bill arrives", icon: Banknote },
  { value: "card", label: "Card at the table", description: "Swipe/tap, settled when the bill arrives", icon: CreditCard },
];

export function PaymentMethodSelect({ value, onChange, enabledMethods }: PaymentMethodSelectProps) {
  // Without settings loaded yet, show every option rather than none —
  // narrowing only once we actually know what's disabled avoids a flash of
  // "no payment methods available" on first render.
  const options = OPTIONS.filter((opt) => enabledMethods === undefined || enabledMethods[opt.value]);
  if (options.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium text-ink/70">Payment</span>
      <div className="space-y-2">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                isActive ? "border-primary bg-primary-light" : "border-border hover:bg-cream-soft"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  isActive ? "bg-primary text-white" : "bg-cream-soft text-ink/50"
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-medium text-ink">{opt.label}</span>
                <span className="block text-xs text-ink/50">{opt.description}</span>
              </span>
              <span
                className={cn(
                  "h-4 w-4 shrink-0 rounded-full border-2",
                  isActive ? "border-primary bg-primary" : "border-border"
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
