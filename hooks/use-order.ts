import useSWR from "swr";

import type { OrderView } from "@/types/order";

const fetcher = (url: string) =>
  fetch(url).then(async (res) => {
    if (!res.ok) throw new Error((await res.json()).error ?? "Not found");
    return res.json();
  });

/** Polls every 5s — simple and cheap, no need for a customer-facing SSE auth scheme for just one order. */
export function useOrder(orderId: string) {
  const { data, error, isLoading, mutate } = useSWR<{ order: OrderView }>(
    orderId ? `/api/orders/${orderId}` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  return { order: data?.order ?? null, isLoading, error, mutate };
}
