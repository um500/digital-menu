import useSWR from "swr";

import { DEMO_RESTAURANT_ID } from "@/config/restaurant";

export interface OpenTableOrder {
  orderId: string;
  orderNumber: string;
  status: string;
  itemCount: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/** Checked once at checkout — is there already an order running for this table? */
export function useTableOpenOrder(tableId: string | null) {
  const { data, isLoading } = useSWR<{ openOrder: OpenTableOrder | null }>(
    tableId ? `/api/tables/${tableId}/active-order?r=${DEMO_RESTAURANT_ID}` : null,
    fetcher
  );

  return { openOrder: data?.openOrder ?? null, isLoading };
}
