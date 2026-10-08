"use client";

import {
  BarChart3,
  Bell,
  ChefHat,
  LayoutGrid,
  Package,
  ShoppingCart,
  SlidersHorizontal,
  Ticket,
  UsersRound,
  UtensilsCrossed,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { GardenCafeLogo, LeafMark } from "@/components/shared/GardenCafeLogo";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin/live-orders", label: "Live Orders", icon: Bell },
  // Kitchen is its own full-screen board (meant for a kitchen tablet), not
  // nested under /admin, but it shares the same admin login — so it belongs
  // in this nav rather than being a URL only admins who know it can reach.
  { href: "/kitchen", label: "Kitchen", icon: ChefHat },
  { href: "/admin/counter", label: "Counter", icon: ShoppingCart },
  { href: "/admin/tables", label: "Tables & QR", icon: LayoutGrid },
  { href: "/admin/inventory", label: "Inventory", icon: Package },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/staff", label: "Staff", icon: UsersRound },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: SlidersHorizontal },
  // Full menu CRUD (categories, items, photos, out-of-stock) lives here now
  // — Sanity Studio (/studio) is still reachable directly for anything this
  // page doesn't cover, but it's no longer the primary way in.
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
] as const;

interface AdminSidebarProps {
  /** Mobile drawer open state. Ignored at the `lg` breakpoint and up, where the sidebar is always visible. */
  open?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ open = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop — mobile only, shown while the drawer is open. */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-60 shrink-0 flex-col bg-ink-sidebar px-4 py-6 transition-transform duration-200 ease-out",
          "lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-2">
          <GardenCafeLogo theme="light" size="sm" showTagline={false} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-full text-cream/50 hover:bg-white/5 hover:text-cream lg:hidden"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "bg-primary text-white" : "text-cream/70 hover:bg-white/5 hover:text-cream"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 px-2 pt-6">
          <LeafMark className="h-5 w-5 text-cream/30" />
          <div className="text-xs leading-tight text-cream/40">
            Great Food
            <br />
            Happier People
          </div>
        </div>
      </aside>
    </>
  );
}
