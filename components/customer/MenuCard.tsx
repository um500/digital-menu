import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { urlForImage } from "@/lib/sanity/image";
import { formatCurrency } from "@/lib/utils";
import type { MenuItem } from "@/types/menu";

interface MenuCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export function MenuCard({ item, onSelect }: MenuCardProps) {
  const imageUrl = urlForImage(item.image)?.width(160).height(160).url();

  return (
    <button
      onClick={() => item.isAvailable && onSelect(item)}
      disabled={!item.isAvailable}
      className="flex w-full items-center gap-3 rounded-xl border border-border bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md disabled:opacity-50"
    >
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-cream-soft">
        {imageUrl && <Image src={imageUrl} alt={item.name} fill className="object-cover" />}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`h-3 w-3 flex-shrink-0 rounded-sm border ${
              item.foodType === "veg" ? "border-green-600" : "border-red-600"
            }`}
          >
            <span
              className={`m-auto mt-[2px] block h-1.5 w-1.5 rounded-full ${
                item.foodType === "veg" ? "bg-green-600" : "bg-red-600"
              }`}
            />
          </span>
          <h3 className="text-sm font-medium text-ink">{item.name}</h3>
          {item.isBestseller && <Badge tone="warning">Bestseller</Badge>}
        </div>
        {item.description && (
          <p className="mt-0.5 line-clamp-1 text-xs text-ink/50">{item.description}</p>
        )}
        <p className="mt-1 text-sm font-semibold text-ink">
          {formatCurrency(item.price)}
        </p>
        {!item.isAvailable && <Badge tone="danger">Sold out</Badge>}
      </div>
    </button>
  );
}
