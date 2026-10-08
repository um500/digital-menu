"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { urlForImage } from "@/lib/sanity/image";
import { cn, formatCurrency } from "@/lib/utils";
import type { AdminMenuItem } from "@/types/admin-menu";

const FOOD_TYPE_DOT: Record<AdminMenuItem["foodType"], string> = {
  veg: "border-green-600 after:bg-green-600",
  "non-veg": "border-red-600 after:bg-red-600",
  egg: "border-amber-600 after:bg-amber-600",
};

export function MenuItemCard({
  item,
  onEdit,
  onDeleted,
  onToggled,
}: {
  item: AdminMenuItem;
  onEdit: () => void;
  onDeleted: () => void;
  onToggled: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const thumbUrl = urlForImage(item.image)?.width(120).height(120).url();

  async function handleToggleAvailable(next: boolean) {
    setIsToggling(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/menu/items/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not update");
      onToggled();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update");
    } finally {
      setIsToggling(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/menu/items/${item._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not delete item");
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete item");
      setIsDeleting(false);
    }
  }

  return (
    <Card>
      <CardBody className="flex gap-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream-soft">
          {thumbUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink/20">—</div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <span
                className={cn(
                  "relative inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border after:h-1.5 after:w-1.5 after:rounded-full",
                  FOOD_TYPE_DOT[item.foodType]
                )}
              />
              <span className="truncate font-medium text-ink">{item.name}</span>
            </div>
            {item.isBestseller && <Badge tone="warning">Bestseller</Badge>}
          </div>

          <p className="text-sm font-semibold text-ink">{formatCurrency(item.price)}</p>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <Switch
            checked={item.isAvailable}
            onChange={handleToggleAvailable}
            disabled={isToggling}
            label={item.isAvailable ? "In stock" : "Out of stock"}
          />

          <div className="flex gap-2 pt-1">
            <Button variant="secondary" size="sm" onClick={onEdit}>
              Edit
            </Button>
            <Button variant="danger" size="sm" isLoading={isDeleting} onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
