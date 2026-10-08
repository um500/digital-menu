import useSWR from "swr";

import type { StaffView } from "@/types/staff";

const fetcher = (url: string) =>
  fetch(url).then(async (res) => {
    if (!res.ok) throw new Error((await res.json()).error ?? "Request failed");
    return res.json();
  });

export function useStaff() {
  const { data, error, isLoading, mutate } = useSWR<{ staff: StaffView[] }>(
    "/api/admin/staff",
    fetcher
  );

  return { staff: data?.staff ?? [], isLoading, error, mutate };
}
