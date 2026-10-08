"use client";

import { Button } from "@/components/ui/button";
import { printBill } from "@/lib/orders/print-bill";
import type { OrderView } from "@/types/order";

interface BillPrintButtonProps {
  order: OrderView;
  restaurantName: string;
  gstNumber?: string;
}

export function BillPrintButton({ order, restaurantName, gstNumber }: BillPrintButtonProps) {
  return (
    <Button variant="secondary" size="sm" onClick={() => printBill(order, restaurantName, gstNumber)}>
      Print bill
    </Button>
  );
}
