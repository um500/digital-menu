import useSWR from "swr";

import type { MenuCategory } from "@/types/menu";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useMenu() {
  const { data, error, isLoading } = useSWR<{ categories: MenuCategory[] }>("/api/menu", fetcher);

  return {
    categories: data?.categories ?? [],
    isLoading,
    error,
  };
}
