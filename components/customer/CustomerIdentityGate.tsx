"use client";

import { useState, type FormEvent } from "react";

import { GardenCafeLogo } from "@/components/shared/GardenCafeLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CustomerIdentityGateProps {
  onSubmit: (name: string, phone: string) => void;
}

/**
 * Shown once per device, before the menu itself — a name + phone number is
 * what ties a customer's orders, loyalty points, and order history
 * together without a real login system. Captured up front (not just at
 * checkout) so "Call waiter" and "My orders" both work the moment the menu
 * opens, not only after a first order is placed.
 */
export function CustomerIdentityGate({ onSubmit }: CustomerIdentityGateProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState(false);

  const phoneValid = /^[0-9]{10}$/.test(phone);
  const nameValid = name.trim().length > 0;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!nameValid || !phoneValid) return;
    onSubmit(name.trim(), phone);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <GardenCafeLogo size="md" showTagline />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-white p-5">
          <div>
            <h1 className="font-display text-lg font-semibold text-ink">Welcome!</h1>
            <p className="mt-1 text-sm text-ink/50">
              Just your name and number — so we can track your order, loyalty points, and order
              history.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="gateName" className="text-sm font-medium text-ink/70">
              Your name
            </label>
            <Input
              id="gateName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Raj"
              maxLength={80}
              autoFocus
            />
            {touched && !nameValid && <p className="text-xs text-red-600">Name is required.</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="gatePhone" className="text-sm font-medium text-ink/70">
              Phone number
            </label>
            <Input
              id="gatePhone"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit number"
            />
            {touched && !phoneValid && <p className="text-xs text-red-600">Enter a valid 10-digit number.</p>}
          </div>

          <Button type="submit" className="w-full" size="lg">
            Continue to menu
          </Button>
        </form>
      </div>
    </div>
  );
}
