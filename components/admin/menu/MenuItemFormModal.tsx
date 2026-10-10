"use client";

import { useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";
import { ALLERGENS } from "@/lib/constants/allergens";
import { urlForImage } from "@/lib/sanity/image";
import type { AdminMenuCategory, AdminMenuItem } from "@/types/admin-menu";
import type { FoodType } from "@/types/menu";

interface MenuItemFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  categories: AdminMenuCategory[];
  /** Present when editing; absent when creating a new item. */
  item?: AdminMenuItem | null;
  /** Pre-selected category when adding a new item from inside a category section. */
  defaultCategoryId?: string;
}

type ImageValue = { _type: "image"; asset: { _type: "reference"; _ref: string } } | null;

export function MenuItemFormModal({
  open,
  onClose,
  onSaved,
  categories,
  item,
  defaultCategoryId,
}: MenuItemFormModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? defaultCategoryId ?? categories[0]?._id ?? "");
  const [price, setPrice] = useState(item?.price ?? 0);
  const [taxPercent, setTaxPercent] = useState(item?.taxPercent ?? 5);
  const [foodType, setFoodType] = useState<FoodType>(item?.foodType ?? "veg");
  const [allergens, setAllergens] = useState<string[]>(item?.allergens ?? []);
  const [isAvailable, setIsAvailable] = useState(item?.isAvailable ?? true);
  const [isBestseller, setIsBestseller] = useState(item?.isBestseller ?? false);
  const [image, setImage] = useState<ImageValue>((item?.image as ImageValue) ?? null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | undefined>(
    urlForImage(item?.image)?.width(160).height(160).url()
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show it immediately from the local file while the upload runs, so
    // picking a photo never feels like it did nothing.
    setImagePreviewUrl(URL.createObjectURL(file));
    setIsUploadingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/menu/upload-image", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not upload image");
      setImage(data.image);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload image");
      setImagePreviewUrl(urlForImage(item?.image)?.width(160).height(160).url());
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!categoryId) {
      setError("Add a category first.");
      return;
    }
    setIsSaving(true);
    setError(null);

    try {
      const url = item ? `/api/admin/menu/items/${item._id}` : "/api/admin/menu/items";
      const method = item ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          categoryId,
          price,
          taxPercent,
          foodType,
          allergens,
          isAvailable,
          isBestseller,
          image,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save menu item");
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save menu item");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-lg font-semibold text-ink">{item ? "Edit item" : "New menu item"}</h2>

        <div className="space-y-1.5">
          <span className="text-sm font-medium text-ink/70">Photo</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-cream-soft text-xs text-ink/40 hover:border-primary"
            >
              {imagePreviewUrl ? (
                // A plain <img>, not next/image: this can momentarily be a local
                // blob: URL (while the upload is in flight) before it becomes a
                // cdn.sanity.io one, and next/image only allows configured
                // remote hosts.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreviewUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                "Add photo"
              )}
              {isUploadingImage && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </span>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={handleImagePick}
            />
            <p className="text-xs text-ink/50">JPG, PNG or WebP, up to 5MB. Optional.</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="item-name" className="text-sm font-medium text-ink/70">
            Name
          </label>
          <Input
            id="item-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Paneer Tikka"
            required
            maxLength={100}
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="item-description" className="text-sm font-medium text-ink/70">
            Description (optional)
          </label>
          <textarea
            id="item-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="Short, appetizing description"
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-light"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="item-category" className="text-sm font-medium text-ink/70">
            Category
          </label>
          <select
            id="item-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-light"
          >
            {categories.length === 0 && <option value="">Add a category first</option>}
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="item-price" className="text-sm font-medium text-ink/70">
              Price (₹)
            </label>
            <Input
              id="item-price"
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="item-tax" className="text-sm font-medium text-ink/70">
              GST %
            </label>
            <Input
              id="item-tax"
              type="number"
              min={0}
              max={100}
              value={taxPercent}
              onChange={(e) => setTaxPercent(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-sm font-medium text-ink/70">Food type</span>
          <div className="flex gap-2">
            {(["veg", "non-veg", "egg"] as const).map((ft) => (
              <button
                key={ft}
                type="button"
                onClick={() => setFoodType(ft)}
                className={`h-9 flex-1 rounded-lg border text-sm font-medium capitalize transition-colors ${
                  foodType === ft
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-white text-ink/70 hover:bg-cream-soft"
                }`}
              >
                {ft}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-sm font-medium text-ink/70">Allergens (optional)</span>
          <div className="flex flex-wrap gap-2">
            {ALLERGENS.map((a) => {
              const checked = allergens.includes(a.value);
              return (
                <button
                  key={a.value}
                  type="button"
                  onClick={() =>
                    setAllergens((prev) =>
                      checked ? prev.filter((v) => v !== a.value) : [...prev, a.value]
                    )
                  }
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    checked
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-white text-ink/60 hover:bg-cream-soft"
                  }`}
                >
                  {a.label}
                </button>
              );
            })}
          </div>
        </div>

        <Switch
          checked={isAvailable}
          onChange={setIsAvailable}
          label="In stock"
          description="Turn off to mark this item out of stock without deleting it"
        />
        <Switch checked={isBestseller} onChange={setIsBestseller} label="Bestseller" description="Shows a highlight badge on the customer menu" />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSaving} disabled={isUploadingImage}>
            {item ? "Save changes" : "Add item"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
