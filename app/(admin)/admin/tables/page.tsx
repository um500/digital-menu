"use client";

import { useState } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { TableBulkActions } from "@/components/admin/tables/TableBulkActions";
import { TableCard } from "@/components/admin/tables/TableCard";
import { TableFormModal } from "@/components/admin/tables/TableFormModal";
import { TableMergeModal } from "@/components/admin/tables/TableMergeModal";
import { TableQrModal } from "@/components/admin/tables/TableQrModal";
import { TableTransferModal } from "@/components/admin/tables/TableTransferModal";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loading } from "@/components/shared/Loading";
import { useTables } from "@/hooks/use-tables";
import type { TableView } from "@/types/table";

export default function TablesPage() {
  const { tables, isLoading, error, mutate } = useTables();
  const [editing, setEditing] = useState<TableView | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [qrTable, setQrTable] = useState<TableView | null>(null);
  const [transferFrom, setTransferFrom] = useState<TableView | null>(null);
  const [mergeFrom, setMergeFrom] = useState<TableView | null>(null);

  const emptyTables = tables.filter((t) => t.status === "empty");
  const occupiedTables = tables.filter((t) => t.status === "occupied" && t.activeOrderId);

  return (
    <AdminShell title="Tables & QR">
      <div className="p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink/50">
            {tables.length} table{tables.length === 1 ? "" : "s"}
          </p>
          <div className="flex items-center gap-2">
            <TableBulkActions tables={tables} />
            <Button size="sm" onClick={() => setIsAdding(true)}>
              + Add table
            </Button>
          </div>
        </div>

        {isLoading && <Loading label="Loading tables..." />}
        {error && <ErrorState message="Could not load tables." onRetry={() => mutate()} />}

        {!isLoading && !error && tables.length === 0 && (
          <p className="py-16 text-center text-sm text-ink/40">
            No tables yet. Add your first table to generate its QR code.
          </p>
        )}

        {!isLoading && !error && tables.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tables.map((table) => (
              <TableCard
                key={table._id}
                table={table}
                onEdit={() => setEditing(table)}
                onShowQr={() => setQrTable(table)}
                onDeleted={() => mutate()}
                onTransfer={() => setTransferFrom(table)}
                onMerge={() => setMergeFrom(table)}
              />
            ))}
          </div>
        )}
      </div>

      <TableFormModal
        key={isAdding ? "add-open" : "add-closed"}
        open={isAdding}
        onClose={() => setIsAdding(false)}
        onSaved={() => mutate()}
      />
      <TableFormModal
        key={editing ? `edit-${editing._id}` : "edit-closed"}
        open={!!editing}
        table={editing}
        onClose={() => setEditing(null)}
        onSaved={() => mutate()}
      />
      <TableQrModal
        key={qrTable ? qrTable._id : "qr-closed"}
        table={qrTable}
        onClose={() => setQrTable(null)}
      />
      <TableTransferModal
        fromTable={transferFrom}
        emptyTables={emptyTables}
        onClose={() => setTransferFrom(null)}
        onTransferred={() => mutate()}
      />
      <TableMergeModal
        fromTable={mergeFrom}
        otherOccupiedTables={occupiedTables.filter((t) => t._id !== mergeFrom?._id)}
        onClose={() => setMergeFrom(null)}
        onMerged={() => mutate()}
      />
    </AdminShell>
  );
}
