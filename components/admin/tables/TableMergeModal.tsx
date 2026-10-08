"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { TableView } from "@/types/table";

interface TableMergeModalProps {
  /** The occupied table whose order will be folded into another; null when closed. */
  fromTable: TableView | null;
  /** Other occupied tables this one could be merged into. */
  otherOccupiedTables: TableView[];
  onClose: () => void;
  onMerged: () => void;
}

export function TableMergeModal({
  fromTable,
  otherOccupiedTables,
  onClose,
  onMerged,
}: TableMergeModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [mergingIntoId, setMergingIntoId] = useState<string | null>(null);

  async function handleMerge(targetTable: TableView) {
    if (!fromTable?.activeOrderId || !targetTable.activeOrderId) return;
    setMergingIntoId(targetTable._id);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceOrderId: fromTable.activeOrderId,
          targetOrderId: targetTable.activeOrderId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not merge the orders");
      onMerged();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not merge the orders");
    } finally {
      setMergingIntoId(null);
    }
  }

  return (
    <Modal open={!!fromTable} onClose={onClose}>
      <div className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-ink">
          Merge {fromTable?.label}&apos;s order into...
        </h2>
        <p className="text-sm text-ink/50">
          {fromTable?.label}&apos;s items move onto the target order and {fromTable?.label} is
          freed up. This can&apos;t be undone.
        </p>

        {otherOccupiedTables.length === 0 && (
          <p className="text-sm text-ink/50">No other occupied tables to merge into.</p>
        )}

        <div className="grid grid-cols-2 gap-2">
          {otherOccupiedTables.map((table) => (
            <Button
              key={table._id}
              type="button"
              variant="secondary"
              isLoading={mergingIntoId === table._id}
              disabled={!!mergingIntoId && mergingIntoId !== table._id}
              onClick={() => handleMerge(table)}
            >
              {table.label}
            </Button>
          ))}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
