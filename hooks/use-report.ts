import useSWR from "swr";

import type { ReportSummaryView } from "@/types/report";

const fetcher = (url: string) =>
  fetch(url).then(async (res) => {
    if (!res.ok) throw new Error((await res.json()).error ?? "Request failed");
    return res.json();
  });

export function useReport(from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const { data, error, isLoading, mutate } = useSWR<{ report: ReportSummaryView }>(
    `/api/admin/reports?${params.toString()}`,
    fetcher
  );

  return { report: data?.report ?? null, isLoading, error, mutate };
}
