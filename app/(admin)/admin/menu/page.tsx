"use client";

import { useState } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { CategoryFormModal } from "@/components/admin/menu/CategoryFormModal";
import { CategorySection } from "@/components/admin/menu/CategorySection";
import { MenuItemFormModal } from "@/components/admin/menu/MenuItemFormModal";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loading } from "@/components/shared/Loading";
import { useAdminMenu } from "@/hooks/use-admin-menu";
import type { AdminMenuCategory, AdminMenuItem } from "@/types/admin-menu";

export default function AdminMenuPage() {
  const { categories, items, isLoading, error, mutate } = useAdminMenu();

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminMenuCategory | null>(null);

  const [editingItem, setEditingItem] = useState<AdminMenuItem | null>(null);
  const [addItemForCategoryId, setAddItemForCategoryId] = useState<string | null>(null);
  const isItemModalOpen = editingItem !== null || addItemForCategoryId !== null;

  return (
    <AdminShell title="Menu">
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-ink/50">
            {categories.length} categor{categories.length === 1 ? "y" : "ies"} · {items.length} item
            {items.length === 1 ? "" : "s"}
          </p>
          <Button size="sm" onClick={() => setIsAddingCategory(true)}>
            + New category
          </Button>
        </div>

        {isLoading && <Loading label="Loading menu..." />}
        {error && <ErrorState message="Could not load the menu." onRetry={() => mutate()} />}

        {!isLoading && !error && categories.length === 0 && (
          <p className="py-16 text-center text-sm text-ink/50">
            No categories yet — add one to start building the menu.
          </p>
        )}

        {!isLoading && !error && categories.length > 0 && (
          <div className="space-y-8">
            {categories.map((category) => (
              <CategorySection
                key={category._id}
                category={category}
                items={items.filter((item) => item.categoryId === category._id)}
                onEditCategory={() => setEditingCategory(category)}
                onDeleteCategory={() => mutate()}
                onAddItem={() => setAddItemForCategoryId(category._id)}
                onEditItem={(item) => setEditingItem(item)}
                onChanged={() => mutate()}
              />
            ))}
          </div>
        )}
      </div>

      <CategoryFormModal
        key={isAddingCategory ? "add-cat-open" : "add-cat-closed"}
        open={isAddingCategory}
        onClose={() => setIsAddingCategory(false)}
        onSaved={() => mutate()}
        nextSortOrder={categories.length}
      />
      <CategoryFormModal
        key={editingCategory ? `edit-cat-${editingCategory._id}` : "edit-cat-closed"}
        open={!!editingCategory}
        category={editingCategory}
        onClose={() => setEditingCategory(null)}
        onSaved={() => mutate()}
      />

      <MenuItemFormModal
        key={editingItem ? `edit-item-${editingItem._id}` : `add-item-${addItemForCategoryId ?? "closed"}`}
        open={isItemModalOpen}
        onClose={() => {
          setEditingItem(null);
          setAddItemForCategoryId(null);
        }}
        onSaved={() => mutate()}
        categories={categories}
        item={editingItem}
        defaultCategoryId={addItemForCategoryId ?? undefined}
      />
    </AdminShell>
  );
}
