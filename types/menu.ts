import type { Image } from "sanity";

export type FoodType = "veg" | "non-veg" | "egg";

export interface MenuItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: Image;
  price: number;
  taxPercent: number;
  foodType: FoodType;
  isAvailable: boolean;
  isBestseller: boolean;
}

export interface MenuCategory {
  _id: string;
  name: string;
  slug: string;
  image?: Image;
  items: MenuItem[];
}
