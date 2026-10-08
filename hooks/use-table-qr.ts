"use client";

import { useEffect, useState } from "react";

/**
 * Lazily fetches a table's signed QR as a data: URL. Used for the small
 * inline thumbnail on each TableCard, the live preview in the edit form,
 * and the full-size view in TableQrModal — all share this one fetch.
 */
export function useTableQr(tableId: string | null | undefined) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tableId) return;

    // Callers that show a QR for a changing tableId (TableQrModal,
    // TableFormModal) are remounted via a `key` on the table's id when the
    // target changes, so this effect never actually re-runs with stale
    // dataUrl/error state left over from a different table.
    let cancelled = false;
    const baseUrl = encodeURIComponent(window.location.origin);

    fetch(`/api/admin/tables/${tableId}/qr?baseUrl=${baseUrl}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not generate QR");
        if (!cancelled) setDataUrl(data.dataUrl);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not generate QR");
      });

    return () => {
      cancelled = true;
    };
  }, [tableId]);

  return { dataUrl, error };
}
