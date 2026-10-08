import useSWR from "swr";

import type { AdminMenuCategory, AdminMenuItem } from "@/types/admin-menu";

const fetcher = (url: string) =>
  fetch(url).then(async (res) => {
    if (!res.ok) throw new Error((await res.json()).error ?? "Request failed");
    return res.json();
  });

export function useAdminMenu() {
  const { data, error, isLoading, mutate } = useSWR<{
    categories: AdminMenuCategory[];
    items: AdminMenuItem[];
  }>("/api/admin/menu", fetcher);

  return {
    categories: data?.categories ?? [],
    items: data?.items ?? [],
    isLoading,
    error,
    mutate,
  };
}
