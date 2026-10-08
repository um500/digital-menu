"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import type { AdminMenuCategory } from "@/types/admin-menu";

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** Present when editing; absent when creating a new category. */
  category?: AdminMenuCategory | null;
  /** Used as the default sort order for a new category (puts it last). */
  nextSortOrder?: number;
}

export function CategoryFormModal({ open, onClose, onSaved, category, nextSortOrder = 0 }: CategoryFormModalProps) {
  const [name, setName] = useState(category?.name ?? "");
  const [sortOrder, setSortOrder] = useState(category?.sortOrder ?? nextSortOrder);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const url = category ? `/api/admin/menu/categories/${category._id}` : "/api/admin/menu/categories";
      const method = category ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, sortOrder }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save category");
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save category");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-lg font-semibold text-ink">{category ? "Edit category" : "New category"}</h2>

        <div className="space-y-1.5">
          <label htmlFor="cat-name" className="text-sm font-medium text-ink/70">
            Name
          </label>
          <Input
            id="cat-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Starters"
            required
            maxLength={60}
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="cat-sort" className="text-sm font-medium text-ink/70">
            Display order
          </label>
          <Input
            id="cat-sort"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
          />
          <p className="text-xs text-ink/50">Lower numbers show first on the customer menu.</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSaving}>
            {category ? "Save changes" : "Create category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
