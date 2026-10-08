import groq from "groq";

// Admin-facing queries deliberately skip the `isPublished == true` filter
// that lib/sanity/queries.ts's MENU_QUERY applies for customers — an admin
// needs to see (and fix) draft/unavailable items too, not just what's live.
// Still scoped by restaurantId for the same multi-tenant isolation reason.
export const ADMIN_CATEGORIES_QUERY = groq`
  *[_type == "category" && restaurantId == $restaurantId] | order(sortOrder asc) {
    _id,
    name,
    "slug": slug.current,
    image,
    sortOrder,
  }
`;

export const ADMIN_MENU_ITEMS_QUERY = groq`
  *[_type == "menuItem" && restaurantId == $restaurantId] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    description,
    image,
    "categoryId": category._ref,
    price,
    taxPercent,
    foodType,
    isAvailable,
    isBestseller,
    isPublished,
  }
`;

export const ADMIN_CATEGORY_ITEM_COUNT_QUERY = groq`
  count(*[_type == "menuItem" && restaurantId == $restaurantId && category._ref == $categoryId])
`;
