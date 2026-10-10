import { useCartStore } from "@/store/cart-store";

/** Thin convenience hook so components don't import the store directly everywhere. */
export function useCart() {
  const lines = useCartStore((s) => s.lines);
  const tableId = useCartStore((s) => s.tableId);
  const customerName = useCartStore((s) => s.customerName);
  const customerPhone = useCartStore((s) => s.customerPhone);
  const setProfile = useCartStore((s) => s.setProfile);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);
  const itemCount = useCartStore((s) => s.itemCount());
  const subtotal = useCartStore((s) => s.subtotal());

  return {
    lines,
    tableId,
    customerName,
    customerPhone,
    setProfile,
    addItem,
    updateQuantity,
    removeItem,
    clear,
    itemCount,
    subtotal,
  };
}
