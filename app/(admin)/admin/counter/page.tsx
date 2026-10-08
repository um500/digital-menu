"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AdminShell } from "@/components/admin/AdminShell";
import { CounterCartPanel, type CounterCartLine } from "@/components/admin/counter/CounterCartPanel";
import { CounterMenuList } from "@/components/admin/counter/CounterMenuList";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loading } from "@/components/shared/Loading";
import { StaffPinGate } from "@/components/shared/StaffPinGate";
import { DEMO_RESTAURANT_ID } from "@/config/restaurant";
import { useActiveStaff } from "@/hooks/use-active-staff";
import { useMenu } from "@/hooks/use-menu";
import { useTables } from "@/hooks/use-tables";
import type { MenuItem } from "@/types/menu";

export default function CounterPage() {
  const router = useRouter();
  const { categories, isLoading, error } = useMenu();
  const { tables } = useTables();
  const { staff } = useActiveStaff();

  const [lines, setLines] = useState<CounterCartLine[]>([]);
  const [tableId, setTableId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);

  const emptyTables = tables.filter((t) => t.status === "empty");

  function handleAdd(item: MenuItem) {
    setLines((prev) => {
      const existing = prev.find((l) => l.menuItemId === item._id);
      if (existing) {
        return prev.map((l) => (l.menuItemId === item._id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { menuItemId: item._id, name: item.name, price: item.price, quantity: 1 }];
    });
  }

  function handleUpdateQuantity(menuItemId: string, quantity: number) {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.menuItemId !== menuItemId)
        : prev.map((l) => (l.menuItemId === menuItemId ? { ...l, quantity } : l))
    );
  }

  async function handlePlaceOrder() {
    setIsPlacing(true);
    setPlaceError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // This page reuses the same public order-creation endpoint the
          // customer QR flow uses — safe here since /admin/* is already
          // session-gated by proxy.ts.
          restaurantId: DEMO_RESTAURANT_ID,
          source: "counter",
          tableId: tableId ?? undefined,
          items: lines.map((l) => ({ menuItemId: l.menuItemId, quantity: l.quantity })),
          customerName: customerName || undefined,
          customerPhone: customerPhone.length === 10 ? customerPhone : undefined,
          staffName: staff?.name,
          // Counter orders are settled at the counter immediately, not via
          // the customer-facing Razorpay flow — default to cash; the admin
          // can still "Mark paid" differently from Live Orders if it was
          // actually a card payment.
          paymentMethod: "cash",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not place order");

      setLines([]);
      setTableId(null);
      setCustomerName("");
      setCustomerPhone("");
      router.push("/admin/live-orders");
    } catch (err) {
      setPlaceError(err instanceof Error ? err.message : "Could not place order");
    } finally {
      setIsPlacing(false);
    }
  }

  return (
    <AdminShell title="Counter">
      <div className="flex justify-end px-4 pt-3">
        <StaffPinGate />
      </div>
      <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
        <div>
          {isLoading && <Loading label="Loading menu..." />}
          {error && <ErrorState message="Could not load the menu." />}
          {!isLoading && !error && <CounterMenuList categories={categories} onAdd={handleAdd} />}
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start">
          <CounterCartPanel
            lines={lines}
            onUpdateQuantity={handleUpdateQuantity}
            emptyTables={emptyTables}
            tableId={tableId}
            onTableChange={setTableId}
            customerName={customerName}
            onCustomerNameChange={setCustomerName}
            customerPhone={customerPhone}
            onCustomerPhoneChange={setCustomerPhone}
            onPlaceOrder={handlePlaceOrder}
            isPlacing={isPlacing}
            error={placeError}
          />
        </div>
      </div>
    </AdminShell>
  );
}
