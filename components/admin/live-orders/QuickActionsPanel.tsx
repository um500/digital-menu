import { BarChart3, LayoutGrid, Package, ShoppingCart } from "lucide-react";
import Link from "next/link";

const ACTIONS = [
  { href: "/admin/counter", label: "New counter order", icon: ShoppingCart },
  { href: "/admin/tables", label: "Manage tables & QR", icon: LayoutGrid },
  { href: "/admin/inventory", label: "Check inventory", icon: Package },
  { href: "/admin/reports", label: "View full reports", icon: BarChart3 },
] as const;

export function QuickActionsPanel() {
  return (
    <div className="space-y-1.5">
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-cream-soft hover:text-ink"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-soft text-primary">
              <Icon className="h-4 w-4" strokeWidth={2} />
            </span>
            {action.label}
          </Link>
        );
      })}
    </div>
  );
}
