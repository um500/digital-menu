import groq from "groq";

// Every query is scoped by restaurantId — this is the Sanity side of the
// multi-tenant isolation rule. Never drop this filter.
export const MENU_QUERY = groq`
  *[_type == "category" && restaurantId == $restaurantId] | order(sortOrder asc) {
    _id,
    name,
    "slug": slug.current,
    image,
    "items": *[_type == "menuItem" && restaurantId == $restaurantId && isPublished == true && references(^._id)] {
      _id,
      name,
      "slug": slug.current,
      description,
      image,
      price,
      taxPercent,
      foodType,
      allergens,
      isAvailable,
      isBestseller,
    }
  }
`;

export const MENU_ITEM_QUERY = groq`
  *[_type == "menuItem" && restaurantId == $restaurantId && _id == $menuItemId][0] {
    _id,
    name,
    price,
    taxPercent,
    isAvailable,
    isPublished,
  }
`;
