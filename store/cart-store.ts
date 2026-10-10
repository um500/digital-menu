import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  menuItemId: string;
  name: string;
  price: number; // display only — the server re-prices from Sanity at checkout
  quantity: number;
  notes?: string;
}

interface CartState {
  tableId: string | null;
  lines: CartLine[];
  // The "account" — name + phone captured once on the menu page before it's
  // shown at all. Persisted on this device so a returning customer (or a
  // customer who refreshes mid-meal) isn't asked again; it's what ties
  // their loyalty points and order history to a phone number without a
  // real login system. Never cleared by clear() — that only empties the
  // cart, not the profile.
  customerName: string | null;
  customerPhone: string | null;
  setTable: (tableId: string | null) => void;
  setProfile: (name: string, phone: string) => void;
  addItem: (item: Omit<CartLine, "quantity">, quantity?: number) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  removeItem: (menuItemId: string) => void;
  clear: () => void;
  itemCount: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      tableId: null,
      lines: [],
      customerName: null,
      customerPhone: null,

      setTable: (tableId) => set({ tableId }),

      setProfile: (name, phone) => set({ customerName: name, customerPhone: phone }),

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.menuItemId === item.menuItemId);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.menuItemId === item.menuItemId ? { ...l, quantity: l.quantity + quantity } : l
              ),
            };
          }
          return { lines: [...state.lines, { ...item, quantity }] };
        }),

      updateQuantity: (menuItemId, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.menuItemId !== menuItemId)
              : state.lines.map((l) => (l.menuItemId === menuItemId ? { ...l, quantity } : l)),
        })),

      removeItem: (menuItemId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.menuItemId !== menuItemId) })),

      clear: () => set({ lines: [] }),

      itemCount: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),

      subtotal: () => get().lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
    }),
    {
      name: "garden-cafe-cart", // localStorage key — per-device convenience only, never trusted as the source of truth for pricing
    }
  )
);
