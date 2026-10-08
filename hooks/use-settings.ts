import useSWR from "swr";

import type { SettingsView } from "@/types/settings";

const fetcher = (url: string) =>
  fetch(url).then(async (res) => {
    if (!res.ok) throw new Error((await res.json()).error ?? "Request failed");
    return res.json();
  });

export function useSettings() {
  const { data, error, isLoading, mutate } = useSWR<{ settings: SettingsView }>(
    "/api/admin/settings",
    fetcher
  );

  return { settings: data?.settings ?? null, isLoading, error, mutate };
}
