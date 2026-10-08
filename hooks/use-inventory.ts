import useSWR from "swr";

import type { InventoryRowView } from "@/types/inventory";

const fetcher = (url: string) =>
  fetch(url).then(async (res) => {
    if (!res.ok) throw new Error((await res.json()).error ?? "Request failed");
    return res.json();
  });

export function useInventory() {
  const { data, error, isLoading, mutate } = useSWR<{ rows: InventoryRowView[] }>(
    "/api/admin/inventory",
    fetcher
  );

  return { rows: data?.rows ?? [], isLoading, error, mutate };
}
