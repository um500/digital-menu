import useSWR from "swr";

import type { TableView } from "@/types/table";

const fetcher = (url: string) =>
  fetch(url).then(async (res) => {
    if (!res.ok) throw new Error((await res.json()).error ?? "Request failed");
    return res.json();
  });

export function useTables() {
  const { data, error, isLoading, mutate } = useSWR<{ tables: TableView[] }>(
    "/api/admin/tables",
    fetcher
  );

  return { tables: data?.tables ?? [], isLoading, error, mutate };
}
