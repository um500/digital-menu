import type { MenuCategory, MenuItem } from "@/types/menu";
import { MenuCard } from "./MenuCard";

interface MenuGridProps {
  categories: MenuCategory[];
  onSelectItem: (item: MenuItem) => void;
}

export function MenuGrid({ categories, onSelectItem }: MenuGridProps) {
  if (categories.length === 0) {
    return <p className="p-6 text-center text-sm text-ink/40">No dishes match right now — try clearing your filters.</p>;
  }

  return (
    <div className="space-y-6 px-4 py-4">
      {categories.map((cat) => (
        <section key={cat._id} id={`category-${cat._id}`}>
          <h2 className="font-display mb-2 text-base font-semibold text-ink">{cat.name}</h2>
          <div className="space-y-2">
            {cat.items.map((item) => (
              <MenuCard key={item._id} item={item} onSelect={onSelectItem} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
