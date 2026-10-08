"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { TableView } from "@/types/table";

interface TableTransferModalProps {
  /** The occupied table whose order is being moved; null when the modal is closed. */
  fromTable: TableView | null;
  emptyTables: TableView[];
  onClose: () => void;
  onTransferred: () => void;
}

export function TableTransferModal({
  fromTable,
  emptyTables,
  onClose,
  onTransferred,
}: TableTransferModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [movingToId, setMovingToId] = useState<string | null>(null);

  async function handleTransfer(toTableId: string) {
    if (!fromTable?.activeOrderId) return;
    setMovingToId(toTableId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${fromTable.activeOrderId}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toTableId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not move the order");
      onTransferred();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not move the order");
    } finally {
      setMovingToId(null);
    }
  }

  return (
    <Modal open={!!fromTable} onClose={onClose}>
      <div className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-ink">
          Move {fromTable?.label}&apos;s order to...
        </h2>

        {emptyTables.length === 0 && (
          <p className="text-sm text-ink/50">No empty tables available right now.</p>
        )}

        <div className="grid grid-cols-2 gap-2">
          {emptyTables.map((table) => (
            <Button
              key={table._id}
              type="button"
              variant="secondary"
              isLoading={movingToId === table._id}
              disabled={!!movingToId && movingToId !== table._id}
              onClick={() => handleTransfer(table._id)}
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
