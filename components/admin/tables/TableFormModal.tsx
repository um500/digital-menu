"use client";

import { QrCode } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useTableQr } from "@/hooks/use-table-qr";
import type { TableView } from "@/types/table";

interface TableFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** Present when editing an existing table; absent when creating a new one. */
  table?: TableView | null;
}

export function TableFormModal({ open, onClose, onSaved, table }: TableFormModalProps) {
  // Initialized straight from props rather than synced via an effect — the
  // parent remounts this component (via a changing `key`) each time it's
  // opened, so these starting values are always correct for that open cycle.
  const [label, setLabel] = useState(table?.label ?? "");
  const [capacity, setCapacity] = useState(table?.capacity ?? 4);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { dataUrl: qrDataUrl } = useTableQr(table?._id);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const url = table ? `/api/admin/tables/${table._id}` : "/api/admin/tables";
      const method = table ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, capacity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save table");
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save table");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-ink">
          {table ? "Edit table" : "Add table"}
        </h2>

        <div className="flex gap-4">
          <div className="flex-1 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="label" className="text-sm font-medium text-ink/70">
                Table name
              </label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Table 4"
                required
                maxLength={40}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="capacity" className="text-sm font-medium text-ink/70">
                Seating capacity
              </label>
              <Input
                id="capacity"
                type="number"
                min={1}
                max={50}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="flex w-28 shrink-0 flex-col items-center gap-1.5">
            <div className="flex h-28 w-28 items-center justify-center rounded-xl border border-dashed border-border bg-cream-soft">
              {table ? (
                qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- a data: URL preview
                  <img src={qrDataUrl} alt="" className="h-full w-full object-contain p-1.5" />
                ) : (
                  <span className="h-5 w-5 animate-pulse rounded bg-border" />
                )
              ) : (
                <QrCode className="h-8 w-8 text-ink/20" strokeWidth={1.5} />
              )}
            </div>
            <p className="text-center text-[11px] text-ink/40">
              {table ? "Live QR" : "Generated after saving"}
            </p>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSaving}>
            {table ? "Save changes" : "Add table"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
