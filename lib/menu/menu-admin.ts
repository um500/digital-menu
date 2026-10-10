import "server-only";

import { ADMIN_CATEGORIES_QUERY, ADMIN_CATEGORY_ITEM_COUNT_QUERY, ADMIN_MENU_ITEMS_QUERY } from "@/lib/sanity/admin-queries";
import { sanityServerClient } from "@/lib/sanity/server-client";
import type { CreateCategoryInput, CreateMenuItemInput, UpdateCategoryInput, UpdateMenuItemInput } from "@/lib/validations/menu";
import type { AdminMenuCategory, AdminMenuItem } from "@/types/admin-menu";

export class MenuNotFoundError extends Error {
  constructor(what: "Category" | "Menu item") {
    super(`${what} not found.`);
  }
}

export class CategoryInUseError extends Error {
  constructor() {
    super("This category still has menu items in it — move or delete those first.");
  }
}

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  // Sanity doesn't enforce slug uniqueness for us, and nothing else in the
  // app looks items up by slug — this suffix just keeps two "Paneer Tikka"
  // entries from looking identical in Studio, nothing more.
  return `${base || "item"}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function listAdminMenu(
  restaurantId: string
): Promise<{ categories: AdminMenuCategory[]; items: AdminMenuItem[] }> {
  // Uses the write client (useCdn: false), not the public CDN-cached one —
  // an admin who just saved a change needs to see it immediately, not after
  // the CDN's few-second propagation delay.
  const [categories, items] = await Promise.all([
    sanityServerClient.fetch<AdminMenuCategory[]>(ADMIN_CATEGORIES_QUERY, { restaurantId }),
    sanityServerClient.fetch<AdminMenuItem[]>(ADMIN_MENU_ITEMS_QUERY, { restaurantId }),
  ]);
  return { categories, items };
}

/** Fetches a category and throws unless it belongs to this restaurant. */
async function getOwnedCategory(restaurantId: string, categoryId: string) {
  const doc = await sanityServerClient.fetch<{ _id: string; restaurantId: string } | null>(
    `*[_type == "category" && _id == $categoryId][0]{ _id, restaurantId }`,
    { categoryId }
  );
  if (!doc || doc.restaurantId !== restaurantId) throw new MenuNotFoundError("Category");
  return doc;
}

async function getOwnedMenuItem(restaurantId: string, itemId: string) {
  const doc = await sanityServerClient.fetch<{ _id: string; restaurantId: string } | null>(
    `*[_type == "menuItem" && _id == $itemId][0]{ _id, restaurantId }`,
    { itemId }
  );
  if (!doc || doc.restaurantId !== restaurantId) throw new MenuNotFoundError("Menu item");
  return doc;
}

export async function createCategory(restaurantId: string, input: CreateCategoryInput) {
  return sanityServerClient.create({
    _type: "category",
    restaurantId,
    name: input.name,
    slug: { _type: "slug", current: slugify(input.name) },
    sortOrder: input.sortOrder,
  });
}

export async function updateCategory(restaurantId: string, categoryId: string, input: UpdateCategoryInput) {
  await getOwnedCategory(restaurantId, categoryId);
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.sortOrder !== undefined) patch.sortOrder = input.sortOrder;
  return sanityServerClient.patch(categoryId).set(patch).commit();
}

export async function deleteCategory(restaurantId: string, categoryId: string) {
  await getOwnedCategory(restaurantId, categoryId);
  const itemCount = await sanityServerClient.fetch<number>(ADMIN_CATEGORY_ITEM_COUNT_QUERY, {
    restaurantId,
    categoryId,
  });
  if (itemCount > 0) throw new CategoryInUseError();
  await sanityServerClient.delete(categoryId);
}

export async function createMenuItem(restaurantId: string, input: CreateMenuItemInput) {
  await getOwnedCategory(restaurantId, input.categoryId);
  return sanityServerClient.create({
    _type: "menuItem",
    restaurantId,
    name: input.name,
    slug: { _type: "slug", current: slugify(input.name) },
    description: input.description || undefined,
    image: input.image ?? undefined,
    category: { _type: "reference", _ref: input.categoryId },
    price: input.price,
    taxPercent: input.taxPercent,
    foodType: input.foodType,
    allergens: input.allergens,
    isAvailable: input.isAvailable,
    isBestseller: input.isBestseller,
    // Created straight from the dashboard, not Studio's draft workflow — an
    // admin adding an item here expects it live on the customer menu right
    // away, so there's no separate "publish" step to forget.
    isPublished: true,
  });
}

export async function updateMenuItem(restaurantId: string, itemId: string, input: UpdateMenuItemInput) {
  await getOwnedMenuItem(restaurantId, itemId);
  if (input.categoryId) await getOwnedCategory(restaurantId, input.categoryId);

  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.description !== undefined) patch.description = input.description || undefined;
  if (input.categoryId !== undefined) patch.category = { _type: "reference", _ref: input.categoryId };
  if (input.price !== undefined) patch.price = input.price;
  if (input.taxPercent !== undefined) patch.taxPercent = input.taxPercent;
  if (input.foodType !== undefined) patch.foodType = input.foodType;
  if (input.allergens !== undefined) patch.allergens = input.allergens;
  if (input.isAvailable !== undefined) patch.isAvailable = input.isAvailable;
  if (input.isBestseller !== undefined) patch.isBestseller = input.isBestseller;
  if (input.image !== undefined) patch.image = input.image ?? undefined;

  return sanityServerClient.patch(itemId).set(patch).commit();
}

export async function deleteMenuItem(restaurantId: string, itemId: string) {
  await getOwnedMenuItem(restaurantId, itemId);
  await sanityServerClient.delete(itemId);
}

/** Uploads an image to Sanity's asset store and returns a ready-to-save image field value. */
export async function uploadMenuImage(buffer: Buffer, filename: string, contentType: string) {
  const asset = await sanityServerClient.assets.upload("image", buffer, {
    filename,
    contentType,
  });
  return {
    _type: "image" as const,
    asset: { _type: "reference" as const, _ref: asset._id },
  };
}
