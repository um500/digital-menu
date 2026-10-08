import useSWR from "swr";

import type { PublicSettingsView } from "@/types/settings";

const fetcher = (url: string) =>
  fetch(url).then(async (res) => {
    if (!res.ok) throw new Error((await res.json()).error ?? "Request failed");
    return res.json();
  });

export function usePublicSettings() {
  const { data, isLoading } = useSWR<PublicSettingsView>("/api/settings/public", fetcher);
  return { settings: data, isLoading };
}
