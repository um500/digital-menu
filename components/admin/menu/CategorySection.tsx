"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { AdminMenuCategory, AdminMenuItem } from "@/types/admin-menu";

import { MenuItemCard } from "./MenuItemCard";

export function CategorySection({
  category,
  items,
  onEditCategory,
  onDeleteCategory,
  onAddItem,
  onEditItem,
  onChanged,
}: {
  category: AdminMenuCategory;
  items: AdminMenuItem[];
  onEditCategory: () => void;
  onDeleteCategory: () => void;
  onAddItem: () => void;
  onEditItem: (item: AdminMenuItem) => void;
  onChanged: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDeleteCategory() {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/menu/categories/${category._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not delete category");
      onDeleteCategory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete category");
      setIsDeleting(false);
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">
          {category.name} <span className="font-normal text-ink/40">({items.length})</span>
        </h2>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={onAddItem}>
            + Item
          </Button>
          <Button variant="ghost" size="sm" onClick={onEditCategory}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" isLoading={isDeleting} onClick={handleDeleteCategory}>
            Delete
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-6 text-center text-sm text-ink/40">
          No items in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <MenuItemCard
              key={item._id}
              item={item}
              onEdit={() => onEditItem(item)}
              onDeleted={onChanged}
              onToggled={onChanged}
            />
          ))}
        </div>
      )}
    </section>
  );
}
