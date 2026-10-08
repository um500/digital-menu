import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { MenuCategory, MenuItem } from "@/types/menu";

export function CounterMenuList({
  categories,
  onAdd,
}: {
  categories: MenuCategory[];
  onAdd: (item: MenuItem) => void;
}) {
  if (categories.length === 0) {
    return <p className="p-4 text-center text-sm text-ink/50">No menu items yet.</p>;
  }

  return (
    <div className="space-y-5">
      {categories.map((cat) => (
        <section key={cat._id}>
          <h2 className="mb-2 text-sm font-semibold text-ink">{cat.name}</h2>
          <div className="space-y-1.5">
            {cat.items.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between rounded-lg border border-border bg-white px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{item.name}</p>
                  <p className="text-xs text-ink/50">{formatCurrency(item.price)}</p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!item.isAvailable}
                  onClick={() => onAdd(item)}
                >
                  {item.isAvailable ? "+ Add" : "Sold out"}
                </Button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
