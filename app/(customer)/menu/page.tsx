"use client";

import { useMemo, useState } from "react";

import { CartDrawer } from "@/components/customer/CartDrawer";
import { CategoryTabs } from "@/components/customer/CategoryTabs";
import { MenuGrid } from "@/components/customer/MenuGrid";
import { MenuHeader } from "@/components/customer/MenuHeader";
import { MenuItemModal } from "@/components/customer/MenuItemModal";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loading } from "@/components/shared/Loading";
import { useCart } from "@/hooks/use-cart";
import { useMenu } from "@/hooks/use-menu";
import type { MenuItem } from "@/types/menu";

export default function MenuPage() {
  const { categories, isLoading, error } = useMenu();
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [search, setSearch] = useState("");
  const [vegOnly, setVegOnly] = useState(false);

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => {
          if (vegOnly && item.foodType !== "veg") return false;
          if (q && !item.name.toLowerCase().includes(q) && !item.description?.toLowerCase().includes(q)) {
            return false;
          }
          return true;
        }),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [categories, search, vegOnly]);

  if (isLoading) return <Loading label="Loading menu..." />;
  if (error) return <ErrorState message="Could not load the menu. Pull to refresh." />;

  function handleSelectCategory(id: string) {
    setActiveCategory(id);
    document.getElementById(`category-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleAddToCart(item: MenuItem, quantity: number, notes?: string) {
    addItem({ menuItemId: item._id, name: item.name, price: item.price, notes }, quantity);
  }

  return (
    <>
      <MenuHeader restaurantName="Garden Cafe" search={search} onSearchChange={setSearch} />
      <CategoryTabs
        categories={categories}
        activeId={activeCategory}
        onSelect={handleSelectCategory}
        vegOnly={vegOnly}
        onToggleVegOnly={setVegOnly}
      />
      <MenuGrid categories={filteredCategories} onSelectItem={setSelectedItem} />
      <MenuItemModal item={selectedItem} onClose={() => setSelectedItem(null)} onAdd={handleAddToCart} />
      <CartDrawer />
    </>
  );
}
