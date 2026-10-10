import type { Image } from "sanity";

import type { FoodType } from "@/types/menu";

export interface AdminMenuCategory {
  _id: string;
  name: string;
  slug: string;
  image?: Image;
  sortOrder: number;
}

export interface AdminMenuItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: Image;
  categoryId: string;
  price: number;
  taxPercent: number;
  foodType: FoodType;
  allergens?: string[];
  isAvailable: boolean;
  isBestseller: boolean;
  isPublished: boolean;
}
