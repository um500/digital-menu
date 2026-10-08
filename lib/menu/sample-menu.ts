import type { MenuCategory, MenuItem } from "@/types/menu";

/**
 * Shown ONLY until a restaurant has real content in Sanity — the moment
 * `getMenu()` finds even one real `category` document for a restaurantId,
 * this fallback stops being used for that restaurant automatically (see
 * `get-menu.ts`). It exists so a brand-new restaurant isn't staring at an
 * empty "no menu yet" screen before anyone has touched Studio.
 *
 * These are real, orderable items (not just a display mock) — their prices
 * are also what `getMenuItemForOrder()` snapshots onto an order, the same
 * server-authoritative way a real Sanity item's price is. IDs are
 * hand-written and prefixed `sample-` so they can never collide with a real
 * Sanity document ID, and so order-pricing code can recognize them.
 */
export const SAMPLE_MENU_ITEM_PREFIX = "sample-";

function sampleItem(
  id: string,
  overrides: Omit<MenuItem, "_id" | "slug" | "taxPercent" | "isAvailable"> & {
    taxPercent?: number;
    isAvailable?: boolean;
  }
): MenuItem {
  return {
    _id: `${SAMPLE_MENU_ITEM_PREFIX}${id}`,
    slug: id,
    taxPercent: 5,
    isAvailable: true,
    ...overrides,
  };
}

export const SAMPLE_MENU: MenuCategory[] = [
  {
    _id: `${SAMPLE_MENU_ITEM_PREFIX}category-starters`,
    name: "Starters",
    slug: "starters",
    items: [
      sampleItem("paneer-tikka", {
        name: "Paneer Tikka",
        description: "Char-grilled cottage cheese marinated in smoky spiced yogurt.",
        price: 220,
        foodType: "veg",
        isBestseller: true,
      }),
      sampleItem("veg-spring-rolls", {
        name: "Veg Spring Rolls",
        description: "Crisp rolls stuffed with peppers, cabbage and carrot.",
        price: 180,
        foodType: "veg",
        isBestseller: false,
      }),
      sampleItem("chicken-65", {
        name: "Chicken 65",
        description: "Deep-fried chicken tossed in curry leaves and red chilli.",
        price: 260,
        foodType: "non-veg",
        isBestseller: false,
      }),
      sampleItem("masala-papad", {
        name: "Masala Papad",
        description: "Roasted papad topped with onion, tomato and chaat masala.",
        price: 60,
        foodType: "veg",
        isBestseller: false,
      }),
    ],
  },
  {
    _id: `${SAMPLE_MENU_ITEM_PREFIX}category-main-course`,
    name: "Main Course",
    slug: "main-course",
    items: [
      sampleItem("paneer-butter-masala", {
        name: "Paneer Butter Masala",
        description: "Cottage cheese simmered in a rich tomato-butter gravy.",
        price: 280,
        foodType: "veg",
        isBestseller: true,
      }),
      sampleItem("dal-makhani", {
        name: "Dal Makhani",
        description: "Slow-cooked black lentils finished with cream.",
        price: 220,
        foodType: "veg",
        isBestseller: false,
      }),
      sampleItem("butter-chicken", {
        name: "Butter Chicken",
        description: "Tandoori chicken in a velvety tomato-cashew gravy.",
        price: 320,
        foodType: "non-veg",
        isBestseller: true,
      }),
      sampleItem("veg-biryani", {
        name: "Veg Biryani",
        description: "Fragrant basmati layered with garden vegetables and spices.",
        price: 240,
        foodType: "veg",
        isBestseller: false,
      }),
      sampleItem("egg-curry", {
        name: "Egg Curry",
        description: "Boiled eggs in a home-style onion-tomato masala.",
        price: 200,
        foodType: "egg",
        isBestseller: false,
      }),
    ],
  },
  {
    _id: `${SAMPLE_MENU_ITEM_PREFIX}category-beverages`,
    name: "Beverages",
    slug: "beverages",
    items: [
      sampleItem("masala-chai", {
        name: "Masala Chai",
        description: "Hand-brewed tea with ginger and whole spices.",
        price: 40,
        foodType: "veg",
        isBestseller: true,
      }),
      sampleItem("fresh-lime-soda", {
        name: "Fresh Lime Soda",
        description: "Sweet, salted or mixed — made fresh to order.",
        price: 60,
        foodType: "veg",
        isBestseller: false,
      }),
      sampleItem("cold-coffee", {
        name: "Cold Coffee",
        description: "Blended with ice cream for a thick, frothy finish.",
        price: 90,
        foodType: "veg",
        isBestseller: false,
      }),
      sampleItem("mango-lassi", {
        name: "Mango Lassi",
        description: "Creamy yogurt blended with ripe mango.",
        price: 80,
        foodType: "veg",
        isBestseller: false,
      }),
    ],
  },
  {
    _id: `${SAMPLE_MENU_ITEM_PREFIX}category-desserts`,
    name: "Desserts",
    slug: "desserts",
    items: [
      sampleItem("gulab-jamun", {
        name: "Gulab Jamun (2 pc)",
        description: "Warm milk-solid dumplings soaked in rose-cardamom syrup.",
        price: 90,
        foodType: "veg",
        isBestseller: false,
      }),
      sampleItem("chocolate-brownie", {
        name: "Chocolate Brownie",
        description: "Fudgy brownie served warm, best with a scoop of ice cream.",
        price: 120,
        foodType: "veg",
        isBestseller: true,
      }),
    ],
  },
];

/** Flat lookup used by order pricing — see `getMenuItemForOrder()`. */
const SAMPLE_ITEMS_BY_ID: Map<string, MenuItem> = new Map(
  SAMPLE_MENU.flatMap((category) => category.items).map((item) => [item._id, item])
);

export function findSampleMenuItem(menuItemId: string): MenuItem | null {
  return SAMPLE_ITEMS_BY_ID.get(menuItemId) ?? null;
}
