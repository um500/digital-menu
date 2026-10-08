import useSWR from "swr";

import type { CouponView } from "@/types/coupon";

const fetcher = (url: string) =>
  fetch(url).then(async (res) => {
    if (!res.ok) throw new Error((await res.json()).error ?? "Request failed");
    return res.json();
  });

export function useCoupons() {
  const { data, error, isLoading, mutate } = useSWR<{ coupons: CouponView[] }>(
    "/api/admin/coupons",
    fetcher
  );

  return { coupons: data?.coupons ?? [], isLoading, error, mutate };
}
