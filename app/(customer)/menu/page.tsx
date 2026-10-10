"use client";

import { useMemo, useState } from "react";

import { AllergenFilterBar } from "@/components/customer/AllergenFilterBar";
import { CartDrawer } from "@/components/customer/CartDrawer";
import { CategoryTabs } from "@/components/customer/CategoryTabs";
import { CustomerIdentityGate } from "@/components/customer/CustomerIdentityGate";
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
  const { addItem, tableId, customerName, customerPhone, setProfile } = useCart();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [search, setSearch] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [excludedAllergens, setExcludedAllergens] = useState<string[]>([]);

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => {
          if (vegOnly && item.foodType !== "veg") return false;
          if (excludedAllergens.some((a) => item.allergens?.includes(a))) return false;
          if (q && !item.name.toLowerCase().includes(q) && !item.description?.toLowerCase().includes(q)) {
            return false;
          }
          return true;
        }),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [categories, search, vegOnly, excludedAllergens]);

  // Name + phone, captured once per device, before the menu is shown at
  // all — this is what "Call waiter" and "My orders" key off, and what
  // checkout prefills from. See store/cart-store.ts.
  if (!customerPhone) {
    return <CustomerIdentityGate onSubmit={(name, phone) => setProfile(name, phone)} />;
  }

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
      <MenuHeader
        restaurantName="Garden Cafe"
        tableId={tableId}
        customerName={customerName}
        search={search}
        onSearchChange={setSearch}
      />
      <CategoryTabs
        categories={categories}
        activeId={activeCategory}
        onSelect={handleSelectCategory}
        vegOnly={vegOnly}
        onToggleVegOnly={setVegOnly}
      />
      <AllergenFilterBar excluded={excludedAllergens} onChange={setExcludedAllergens} />
      <MenuGrid categories={filteredCategories} onSelectItem={setSelectedItem} />
      <MenuItemModal item={selectedItem} onClose={() => setSelectedItem(null)} onAdd={handleAddToCart} />
      <CartDrawer />
    </>
  );
}
