"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { ErrorState } from "@/components/shared/ErrorState";
import { Loading } from "@/components/shared/Loading";
import { useCartStore } from "@/store/cart-store";

/**
 * Landing page for a scanned table QR. The URL carries ?r=restaurantId and
 * ?sig=hmac (see lib/qr/qr-url.ts) — we verify both server-side before
 * trusting the tableId at all, then drop the customer onto the menu with
 * their table remembered for checkout.
 */
export default function TablePage() {
  const { tableId } = useParams<{ tableId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const setTable = useCartStore((s) => s.setTable);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const restaurantId = searchParams.get("r");
  const sig = searchParams.get("sig");
  const linkIncomplete = !restaurantId || !sig;

  useEffect(() => {
    // Guard inside the effect too: params are derived at render time above,
    // but this effect only ever needs to run the fetch when both are present.
    if (!restaurantId || !sig) return;

    fetch(`/api/tables/${tableId}?r=${restaurantId}&sig=${sig}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Invalid table link");
        setTable(data.table._id);
        router.replace("/menu");
      })
      .catch((err) => setFetchError(err.message));
  }, [tableId, restaurantId, sig, router, setTable]);

  if (linkIncomplete) {
    return <ErrorState message="This QR code link is incomplete. Please ask staff for a new one." />;
  }
  if (fetchError) return <ErrorState message={fetchError} />;
  return <Loading label="Setting up your table..." />;
}
