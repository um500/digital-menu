"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { useTableQr } from "@/hooks/use-table-qr";
import type { TableView } from "@/types/table";
import { TableStatusBadge } from "./TableStatusBadge";

interface TableCardProps {
  table: TableView;
  onEdit: () => void;
  onShowQr: () => void;
  onDeleted: () => void;
  onTransfer: () => void;
  onMerge: () => void;
}

export function TableCard({ table, onEdit, onShowQr, onDeleted, onTransfer, onMerge }: TableCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { dataUrl } = useTableQr(table._id);

  async function handleDelete() {
    if (!window.confirm(`Remove "${table.label}"? This can't be undone.`)) return;
    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/tables/${table._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not delete table");
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete table");
      setIsDeleting(false);
    }
  }

  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onShowQr}
            className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-cream-soft"
            aria-label={`View QR for ${table.label}`}
          >
            {dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- a data: URL thumbnail
              <img src={dataUrl} alt="" className="h-full w-full object-contain p-1" />
            ) : (
              <span className="h-5 w-5 animate-pulse rounded bg-border" />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-semibold text-ink">{table.label}</span>
              <TableStatusBadge status={table.status} />
            </div>
            <p className="mt-0.5 text-sm text-ink/50">Seats {table.capacity}</p>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-wrap gap-2 pt-1">
          <Button variant="secondary" size="sm" onClick={onShowQr}>
            View QR
          </Button>
          <Button variant="secondary" size="sm" onClick={onEdit}>
            Edit
          </Button>
          {table.status === "occupied" && table.activeOrderId && (
            <>
              <Button variant="secondary" size="sm" onClick={onTransfer}>
                Transfer
              </Button>
              <Button variant="secondary" size="sm" onClick={onMerge}>
                Merge
              </Button>
            </>
          )}
          <Button variant="danger" size="sm" isLoading={isDeleting} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
